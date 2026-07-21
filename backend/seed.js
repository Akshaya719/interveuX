require('dotenv').config();
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: String, description: String, difficulty: String,
  tags: [String], companies: [String], constraints: String, hints: [String],
  starterCode: { javascript: String, python: String, cpp: String, java: String },
  solution: String,
  visibleTestCases: [{ input: String, expectedOutput: String }],
  hiddenTestCases: [{ input: String, expectedOutput: String }],
  createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);

const questions = [
  {
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
    companies: ['Google', 'Amazon', 'Meta', 'Apple'],
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: '2 ≤ nums.length ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\n-10^9 ≤ target ≤ 10^9\nOnly one valid answer exists.',
    hints: [
      'Think about using a hash map to store values you have seen.',
      'For each number, check if (target - number) exists in the map.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your solution here
};`,
      python: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
}`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}`
    },
    solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
}`,
    visibleTestCases: [
      { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
    ],
    hiddenTestCases: [
      { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' },
      { input: 'nums = [1,2,3,4,5], target = 9', expectedOutput: '[3,4]' },
      { input: 'nums = [-1,-2,-3,-4,-5], target = -8', expectedOutput: '[2,4]' },
    ]
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    constraints: '1 ≤ s.length ≤ 10^4\ns consists of parentheses only \'()[]{}\' ',
    hints: [
      'Use a stack to keep track of opening brackets.',
      'When you see a closing bracket, check if the top of stack is the matching opener.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Your solution here
};`,
      python: `def isValid(s: str) -> bool:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    // Your solution here
}`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Your solution here
        return false;
    }
}`
    },
    visibleTestCases: [
      { input: 's = "()"', expectedOutput: 'true' },
      { input: 's = "()[]{}"', expectedOutput: 'true' },
      { input: 's = "(]"', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: 's = "([)]"', expectedOutput: 'false' },
      { input: 's = "{[]}"', expectedOutput: 'true' },
      { input: 's = ""', expectedOutput: 'true' },
    ]
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    tags: ['Hash Map', 'Sliding Window', 'String'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example:
- "abcabcbb" → 3 ("abc")
- "bbbbb" → 1 ("b")
- "pwwkew" → 3 ("wke")`,
    constraints: '0 ≤ s.length ≤ 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
    hints: [
      'Use a sliding window approach with two pointers (left and right).',
      'Use a Set to track characters in the current window.',
      'When a duplicate is found, move the left pointer forward until the duplicate is removed.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Your solution here
};`,
      python: `def lengthOfLongestSubstring(s: str) -> int:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Your solution here
    return 0;
}`,
      java: `import java.util.*;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Your solution here
        return 0;
    }
}`
    },
    visibleTestCases: [
      { input: 's = "abcabcbb"', expectedOutput: '3' },
      { input: 's = "bbbbb"', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: 's = "pwwkew"', expectedOutput: '3' },
      { input: 's = " "', expectedOutput: '1' },
      { input: 's = "dvdf"', expectedOutput: '3' },
    ]
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    companies: ['Amazon', 'Google', 'Apple', 'LinkedIn'],
    description: `Given an integer array nums, find the subarray with the largest sum and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.

Example: nums = [-2,1,-3,4,-1,2,1,-5,4]
The subarray [4,-1,2,1] has the largest sum = 6.`,
    constraints: '1 ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4',
    hints: [
      "Kadane's Algorithm: at each position, decide whether to extend the current subarray or start a new one.",
      'If currentSum + nums[i] < nums[i], start a new subarray at i.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Your solution here
};`,
      python: `def maxSubArray(nums: list[int]) -> int:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your solution here
    return 0;
}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your solution here
        return 0;
    }
}`
    },
    visibleTestCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: 'nums = [1]', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: 'nums = [5,4,-1,7,8]', expectedOutput: '23' },
      { input: 'nums = [-1]', expectedOutput: '-1' },
      { input: 'nums = [-2,-1]', expectedOutput: '-1' },
    ]
  },
  {
    title: 'Binary Search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    companies: ['Google', 'Apple', 'Microsoft'],
    description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
    constraints: '1 ≤ nums.length ≤ 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.',
    hints: [
      'Use two pointers: left = 0, right = nums.length - 1.',
      'Calculate mid = Math.floor((left + right) / 2) and compare nums[mid] with target.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Your solution here
};`,
      python: `def search(nums: list[int], target: int) -> int:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int search(vector<int>& nums, int target) {
    // Your solution here
    return -1;
}`,
      java: `class Solution {
    public int search(int[] nums, int target) {
        // Your solution here
        return -1;
    }
}`
    },
    visibleTestCases: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', expectedOutput: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { input: 'nums = [5], target = 5', expectedOutput: '0' },
      { input: 'nums = [5], target = -5', expectedOutput: '-1' },
    ]
  },
  {
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    constraints: 'The number of nodes in both lists is in the range [0, 50].\n-100 ≤ Node.val ≤ 100\nBoth list1 and list2 are sorted in non-decreasing order.',
    hints: [
      'Use a dummy head node to simplify the merge logic.',
      'At each step, attach the smaller of the two current nodes to the result.'
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val);
 *     this.next = (next===undefined ? null : next);
 * }
 */
function mergeTwoLists(list1, list2) {
  // Your solution here
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

def mergeTwoLists(list1, list2):
    # Your solution here
    pass`,
      cpp: `struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    // Your solution here
    return nullptr;
}`,
      java: `public class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Your solution here
        return null;
    }
}`
    },
    visibleTestCases: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', expectedOutput: '[]' },
    ],
    hiddenTestCases: [
      { input: 'list1 = [], list2 = [0]', expectedOutput: '[0]' },
      { input: 'list1 = [1], list2 = [2]', expectedOutput: '[1,2]' },
    ]
  },
  {
    title: 'Number of Islands',
    difficulty: 'Medium',
    tags: ['Array', 'BFS', 'DFS', 'Graph', 'Matrix'],
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Bloomberg'],
    description: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.`,
    constraints: 'm == grid.length\nn == grid[i].length\n1 ≤ m, n ≤ 300\ngrid[i][j] is \'0\' or \'1\'.',
    hints: [
      'Use DFS or BFS to explore each island.',
      'When you find a \'1\', increment your counter and mark all connected \'1\'s as visited by setting them to \'0\'.'
    ],
    starterCode: {
      javascript: `/**
 * @param {character[][]} grid
 * @return {number}
 */
function numIslands(grid) {
  // Your solution here
};`,
      python: `def numIslands(grid: list[list[str]]) -> int:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

int numIslands(vector<vector<char>>& grid) {
    // Your solution here
    return 0;
}`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        // Your solution here
        return 0;
    }
}`
    },
    visibleTestCases: [
      { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1' },
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3' },
    ],
    hiddenTestCases: [
      { input: 'grid = [["1"]]', expectedOutput: '1' },
      { input: 'grid = [["0"]]', expectedOutput: '0' },
    ]
  },
  {
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Math', 'Memoization'],
    companies: ['Amazon', 'Google', 'Adobe'],
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    constraints: '1 ≤ n ≤ 45',
    hints: [
      'This is essentially the Fibonacci sequence.',
      'The number of ways to reach step n = ways(n-1) + ways(n-2).'
    ],
    starterCode: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
  // Your solution here
};`,
      python: `def climbStairs(n: int) -> int:
    # Your solution here
    pass`,
      cpp: `int climbStairs(int n) {
    // Your solution here
    return 0;
}`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Your solution here
        return 0;
    }
}`
    },
    visibleTestCases: [
      { input: 'n = 2', expectedOutput: '2' },
      { input: 'n = 3', expectedOutput: '3' },
    ],
    hiddenTestCases: [
      { input: 'n = 1', expectedOutput: '1' },
      { input: 'n = 10', expectedOutput: '89' },
      { input: 'n = 45', expectedOutput: '1836311903' },
    ]
  },
  {
    title: 'Word Search',
    difficulty: 'Medium',
    tags: ['Array', 'Backtracking', 'DFS', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
    description: `Given an m x n grid of characters board and a string word, return true if word exists in the grid.

The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.`,
    constraints: 'm == board.length\nn = board[i].length\n1 ≤ m, n ≤ 6\n1 ≤ word.length ≤ 15\nboard and word consist of only lowercase and uppercase English letters.',
    hints: [
      'Use DFS with backtracking.',
      'Mark cells as visited during search and unmark them on backtrack.'
    ],
    starterCode: {
      javascript: `/**
 * @param {character[][]} board
 * @param {string} word
 * @return {boolean}
 */
function exist(board, word) {
  // Your solution here
};`,
      python: `def exist(board: list[list[str]], word: str) -> bool:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

bool exist(vector<vector<char>>& board, string word) {
    // Your solution here
    return false;
}`,
      java: `class Solution {
    public boolean exist(char[][] board, String word) {
        // Your solution here
        return false;
    }
}`
    },
    visibleTestCases: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', expectedOutput: 'true' },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', expectedOutput: 'true' },
    ],
    hiddenTestCases: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', expectedOutput: 'false' },
    ]
  },
  {
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    companies: ['Google', 'Amazon', 'Apple', 'Microsoft', 'Adobe'],
    description: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).`,
    constraints: 'nums1.length == m\nnums2.length == n\n0 ≤ m ≤ 1000\n0 ≤ n ≤ 1000\n1 ≤ m + n ≤ 2000\n-10^6 ≤ nums1[i], nums2[i] ≤ 10^6',
    hints: [
      'Binary search on the smaller array.',
      'Partition both arrays such that the left half contains exactly (m+n+1)/2 elements.',
      'The median is determined by the max of left halves and min of right halves.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
  // Your solution here
};`,
      python: `def findMedianSortedArrays(nums1: list[int], nums2: list[int]) -> float:
    # Your solution here
    pass`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Your solution here
    return 0.0;
}`,
      java: `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your solution here
        return 0.0;
    }
}`
    },
    visibleTestCases: [
      { input: 'nums1 = [1,3], nums2 = [2]', expectedOutput: '2.00000' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', expectedOutput: '2.50000' },
    ],
    hiddenTestCases: [
      { input: 'nums1 = [0,0], nums2 = [0,0]', expectedOutput: '0.00000' },
      { input: 'nums1 = [], nums2 = [1]', expectedOutput: '1.00000' },
    ]
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Question.deleteMany({});
  console.log('Cleared existing questions');

  const inserted = await Question.insertMany(questions);
  console.log(`✅ Seeded ${inserted.length} questions:`);
  inserted.forEach(q => console.log(`   - [${q.difficulty}] ${q.title}`));

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(err => { console.error(err); process.exit(1); });
