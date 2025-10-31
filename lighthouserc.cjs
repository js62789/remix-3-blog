module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "PORT=3000 deno task start",
      url: [
        "http://localhost:3000",
        "http://localhost:3000/posts",
        "http://localhost:3000/posts/my-first-post",
        "http://localhost:3000/login",
        "http://localhost:3000/register",
      ],
      settings: {
        // Simulate mobile network for better testing
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        // Focus on network dependency tree optimization
        "critical-request-chains": ["error", { maxLength: 2 }],
        "network-requests": ["warn", { maxLength: 50 }],
        "resource-summary:script:count": ["warn", { maxNumericValue: 10 }],
        "resource-summary:script:size": ["warn", { maxNumericValue: 500000 }],

        // Performance optimizations related to your bundle structure
        "unused-javascript": ["warn", { maxLength: 30000 }],
        "render-blocking-resources": ["error", { maxLength: 0 }],
        "unminified-javascript": "error",

        // Overall performance targets
        "categories:performance": ["warn", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.8 }],
        "categories:seo": ["error", { minScore: 0.9 }],

        // Modern web standards
        "uses-http2": "off", // May not be available in dev
        "uses-text-compression": "warn",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
