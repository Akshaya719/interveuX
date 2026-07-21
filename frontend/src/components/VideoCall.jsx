import React, { useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { Mic, MicOff, Video, VideoOff, PhoneCall } from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

const VideoCall = ({ socket, sessionId }) => {
  const { user } = useAuthStore();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // idle | calling | connected

  // Create and send an offer
  const createAndSendOffer = async () => {
    const pc = peerConnectionRef.current;
    if (!pc || pc.signalingState === 'closed') return;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('webrtc-offer', { sessionId, offer });
      setCallStatus('calling');
    } catch (e) {
      console.error('Error creating offer', e);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const setupPeerConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Error accessing media devices.', error);
        setCallStatus('idle');
        return;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
          setCallStatus('connected');
        }
      };

      // Send ICE candidates to the other peer
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-ice-candidate', { sessionId, candidate: event.candidate });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setIsConnected(false);
          setCallStatus('idle');
        }
      };
    };

    setupPeerConnection();

    // FIX: Both sides listen for user-joined AND webrtc-offer.
    // The last person to join sends the offer. If both are already present,
    // a manual "Start Call" button is shown as fallback.
    const handleUserJoined = async () => {
      // Small delay to ensure both sides have set up their peer connections
      await new Promise(r => setTimeout(r, 500));
      createAndSendOffer();
    };

    const handleOffer = async (offer) => {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState === 'closed') return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { sessionId, answer });
      } catch (e) {
        console.error('Error handling offer', e);
      }
    };

    const handleAnswer = async (answer) => {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState === 'closed') return;
      try {
        if (pc.remoteDescription) return; // Ignore duplicate answers
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        console.error('Error handling answer', e);
      }
    };

    const handleIceCandidate = async (candidate) => {
      const pc = peerConnectionRef.current;
      if (!pc || pc.signalingState === 'closed') return;
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error('Error adding ICE candidate', e);
      }
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('webrtc-offer', handleOffer);
    socket.on('webrtc-answer', handleAnswer);
    socket.on('webrtc-ice-candidate', handleIceCandidate);

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      socket.off('user-joined', handleUserJoined);
      socket.off('webrtc-offer', handleOffer);
      socket.off('webrtc-answer', handleAnswer);
      socket.off('webrtc-ice-candidate', handleIceCandidate);
    };
  }, [socket, sessionId]);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">

      {/* Remote Video (Main PiP) */}
      <div className={`relative bg-slate-900 border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 pointer-events-auto ${isConnected ? 'w-64 h-48 opacity-100' : 'w-0 h-0 opacity-0 border-none'}`}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
          Peer
        </div>
      </div>

      {/* Local Video (Smaller PiP) */}
      <div className="relative bg-slate-800 border-2 border-emerald-500/50 rounded-lg overflow-hidden shadow-xl w-40 h-28 pointer-events-auto group">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity ${!isVideoOn && 'opacity-20'}`}
        />

        {/* Controls Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={toggleAudio} title={isAudioOn ? 'Mute' : 'Unmute'} className={`p-2 rounded-full ${isAudioOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'} text-white transition`}>
            {isAudioOn ? <Mic size={14} /> : <MicOff size={14} />}
          </button>
          <button onClick={toggleVideo} title={isVideoOn ? 'Turn off video' : 'Turn on video'} className={`p-2 rounded-full ${isVideoOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'} text-white transition`}>
            {isVideoOn ? <Video size={14} /> : <VideoOff size={14} />}
          </button>
          {/* FIX: Manual "Start Call" fallback button if auto-connect fails (e.g., after a page refresh) */}
          {!isConnected && (
            <button onClick={createAndSendOffer} title="Start/Retry call" className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition">
              <PhoneCall size={14} />
            </button>
          )}
        </div>

        <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">
          {callStatus === 'calling' ? '⟳ Connecting...' : callStatus === 'connected' ? '✓ Live' : 'You'}
        </div>
      </div>

    </div>
  );
};

export default VideoCall;
