const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const executeCode = async (req, res) => {
  try {
    const { language, code, testCases } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Code is required' });
    }

    let fullCode = code;

    // Helper: if test cases exist and user defined a function, auto-append invocations if not already called
    if (Array.isArray(testCases) && testCases.length > 0) {
      if (language === 'javascript') {
        const fnMatch = code.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/);
        if (fnMatch && !code.includes(`${fnMatch[1]}(`)) {
          const fnName = fnMatch[1];
          let testInvocations = '\n\n// Auto-generated test execution\n';
          testCases.forEach(tc => {
            if (tc.input) {
              // Extract arguments from input string like "nums = [2,7], target = 9" or "s = \"abc\""
              const args = tc.input.split(',').map(arg => {
                const parts = arg.split('=');
                return parts.length > 1 ? parts.slice(1).join('=').trim() : arg.trim();
              }).join(', ');
              testInvocations += `try { console.log(JSON.stringify(${fnName}(${args}))); } catch(e) { console.error(e.message); }\n`;
            }
          });
          fullCode += testInvocations;
        }
      } else if (language === 'python') {
        const fnMatch = code.match(/def\s+([a-zA-Z0-9_$]+)\s*\(/);
        if (fnMatch && !code.includes(`${fnMatch[1]}(`)) {
          const fnName = fnMatch[1];
          let testInvocations = '\n\n# Auto-generated test execution\nimport json\n';
          testCases.forEach(tc => {
            if (tc.input) {
              const args = tc.input.split(',').map(arg => {
                const parts = arg.split('=');
                return parts.length > 1 ? parts.slice(1).join('=').trim() : arg.trim();
              }).join(', ');
              testInvocations += `try:\n    res = ${fnName}(${args})\n    print(json.dumps(res) if res is not None else "")\nexcept Exception as e:\n    print(e)\n`;
            }
          });
          fullCode += testInvocations;
        }
      }
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'intervuex-exec-'));
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    const timeoutMs = 5000;

    if (language === 'javascript') {
      const filePath = path.join(tmpDir, 'script.js');
      fs.writeFileSync(filePath, fullCode);

      await new Promise((resolve) => {
        execFile('node', [filePath], { timeout: timeoutMs }, (error, outStr, errStr) => {
          stdout = outStr || '';
          stderr = errStr || '';
          if (error) {
            exitCode = error.code || 1;
            if (error.killed) stderr += '\n[Execution Timed Out (5s)]';
            else if (!stderr) stderr = error.message;
          }
          resolve();
        });
      });
    } else if (language === 'python') {
      const filePath = path.join(tmpDir, 'script.py');
      fs.writeFileSync(filePath, fullCode);

      await new Promise((resolve) => {
        execFile('python3', [filePath], { timeout: timeoutMs }, (error, outStr, errStr) => {
          stdout = outStr || '';
          stderr = errStr || '';
          if (error) {
            exitCode = error.code || 1;
            if (error.killed) stderr += '\n[Execution Timed Out (5s)]';
            else if (!stderr) stderr = error.message;
          }
          resolve();
        });
      });
    } else if (language === 'cpp') {
      const srcPath = path.join(tmpDir, 'main.cpp');
      const binPath = path.join(tmpDir, 'main');
      fs.writeFileSync(srcPath, fullCode);

      await new Promise((resolve) => {
        execFile('g++', [srcPath, '-o', binPath], { timeout: 8000 }, (compileErr, cOut, cErr) => {
          if (compileErr) {
            stderr = cErr || compileErr.message || 'Compilation error';
            exitCode = 1;
            resolve();
          } else {
            execFile(binPath, [], { timeout: timeoutMs }, (runErr, outStr, errStr) => {
              stdout = outStr || '';
              stderr = errStr || '';
              if (runErr) {
                exitCode = runErr.code || 1;
                if (runErr.killed) stderr += '\n[Execution Timed Out (5s)]';
              }
              resolve();
            });
          }
        });
      });
    } else if (language === 'java') {
      const filePath = path.join(tmpDir, 'Solution.java');
      fs.writeFileSync(filePath, fullCode);

      await new Promise((resolve) => {
        execFile('javac', [filePath], { timeout: 8000 }, (compileErr, cOut, cErr) => {
          if (compileErr) {
            stderr = cErr || 'Java compiler error';
            exitCode = 1;
            resolve();
          } else {
            execFile('java', ['-cp', tmpDir, 'Solution'], { timeout: timeoutMs }, (runErr, outStr, errStr) => {
              stdout = outStr || '';
              stderr = errStr || '';
              if (runErr) exitCode = runErr.code || 1;
              resolve();
            });
          }
        });
      });
    } else {
      return res.status(400).json({ message: 'Unsupported language' });
    }

    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}

    const outputText = stderr ? `${stdout ? stdout + '\n' : ''}${stderr}` : (stdout || 'Program executed successfully with no output.');

    res.status(200).json({
      run: {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        output: outputText.trim(),
        code: exitCode,
      }
    });

  } catch (error) {
    console.error('Execution Error:', error.message);
    res.status(500).json({ message: 'Failed to execute code' });
  }
};

module.exports = { executeCode };
