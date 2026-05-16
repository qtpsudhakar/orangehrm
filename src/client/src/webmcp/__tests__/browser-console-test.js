/**
 * WebMCP Browser Console Test Script
 * 
 * This script can be pasted into the browser console (F12) when OrangeHRM is loaded
 * to test the WebMCP tools directly.
 * 
 * Usage:
 * 1. Open OrangeHRM in browser
 * 2. Press F12 to open DevTools
 * 3. Go to Console tab
 * 4. Paste the contents of this file
 * 5. Results will be logged to console
 */

(async function webmcpBrowserTest() {
  console.clear();
  console.log('%c=== WebMCP Browser Test ===', 'font-size: 16px; font-weight: bold; color: #0066cc');
  console.log();

  // Check if WebMCP debug API is available
  if (!window.webmcp) {
    console.error('%c✗ WebMCP debug API not available', 'color: red; font-weight: bold');
    console.error(
      'Make sure OrangeHRM is fully loaded and WEBMCP_ENABLED is set in localStorage'
    );
    return;
  }

  console.log('%cTest Suite: WebMCP Tools', 'font-size: 14px; font-weight: bold; color: #0066cc');
  console.log();

  // Test 1: List available tools
  console.log('%cTEST 1: List Registered Tools', 'font-weight: bold; color: #006600');
  try {
    const tools = window.webmcp.tools();
    console.log(`Found ${tools.length} registered tools:`);
    tools.forEach((tool, i) => {
      console.log(`  ${i + 1}. ${tool}`);
    });
  } catch (error) {
    console.error('Error listing tools:', error.message);
  }
  console.log();

  // Test 2: Execute read tools
  console.log('%cTEST 2: Execute Read Tools', 'font-weight: bold; color: #006600');

  const readTools = [
    {name: 'list_projects', args: {}},
    {name: 'list_leave_types', args: {}},
    {name: 'search_employees', args: {limit: 5}},
    {name: 'list_job_titles', args: {}},
  ];

  for (const {name, args} of readTools) {
    try {
      console.log(`\nExecuting: ${name}`);
      const result = await window.webmcp.executeTool(name, args);
      if (result.success) {
        console.log(`  ✓ Success: ${result.message}`);
        if (result.data) {
          console.log(`  Data:`, result.data);
        }
      } else {
        console.error(`  ✗ Failed: ${result.message}`);
        if (result.errorCode) console.error(`  Error Code: ${result.errorCode}`);
      }
    } catch (error) {
      console.error(`  ✗ Exception: ${error.message}`);
    }
  }
  console.log();

  // Test 3: Execute write tool with validation
  console.log('%cTEST 3: Write Tools - Input Validation', 'font-weight: bold; color: #006600');

  console.log('\nScenario 1: apply_leave with invalid input (missing required fields)');
  try {
    const result = await window.webmcp.executeTool('apply_leave', {
      leaveTypeId: 1,
      // Missing fromDate and toDate
    });
    if (result.success) {
      console.log('  ✓ Success:', result.message);
    } else {
      console.log(`  ✗ Validation caught error: ${result.message}`);
      console.log(`  Error Code: ${result.errorCode}`);
    }
  } catch (error) {
    console.error('  ✗ Exception:', error.message);
  }

  console.log('\nScenario 2: apply_leave with valid input');
  try {
    const result = await window.webmcp.executeTool('apply_leave', {
      leaveTypeId: 1,
      fromDate: '2026-05-20',
      toDate: '2026-05-22',
      comment: 'Vacation',
    });
    if (result.success) {
      console.log('  ✓ Success:', result.message);
      if (result.data) console.log('  Data:', result.data);
    } else {
      console.log(`  ✗ Failed: ${result.message}`);
      if (result.errorCode) console.log(`  Error Code: ${result.errorCode}`);
    }
  } catch (error) {
    console.error('  ✗ Exception:', error.message);
  }
  console.log();

  // Test 4: Role-based access control
  console.log('%cTEST 4: Role-Based Access Control', 'font-weight: bold; color: #006600');
  try {
    const currentRole = localStorage.getItem('WEBMCP_ROLE') || 'admin (default)';
    console.log(`Current role: ${currentRole}`);
    console.log('\nTools with role restrictions:');
    console.log('  - search_employees: admin, supervisor');
    console.log('  - apply_leave: admin, supervisor, ess');
    console.log('  - approve_leave_request: admin, supervisor');
    console.log('  - shortlist_candidate: admin, supervisor');
    console.log('\nNote: Role checks are enforced server-side on API calls');
  } catch (error) {
    console.error('Error checking role:', error.message);
  }
  console.log();

  // Test 5: Audit logs
  console.log('%cTEST 5: Tool Execution Audit Log', 'font-weight: bold; color: #006600');
  try {
    const logs = window.webmcp.auditLogs();
    console.log(`Total audit entries: ${logs.length}`);
    if (logs.length > 0) {
      console.log('\nMost recent entries:');
      const recentLogs = logs.slice(-5);
      recentLogs.forEach((log, i) => {
        console.log(`\n  ${i + 1}. ${log.toolName}`);
        console.log(`     Time: ${log.startedAt}`);
        console.log(`     Status: ${log.success ? '✓ Success' : '✗ Failed'}`);
        console.log(`     Duration: ${log.durationMs}ms`);
        console.log(`     Input: `, log.input);
        if (log.errorCode) console.log(`     Error Code: ${log.errorCode}`);
      });
    }
  } catch (error) {
    console.error('Error retrieving audit logs:', error.message);
  }
  console.log();

  // Test 6: Feature toggle
  console.log('%cTEST 6: Feature Configuration', 'font-weight: bold; color: #006600');
  try {
    const isEnabled = localStorage.getItem('WEBMCP_ENABLED');
    console.log(`WEBMCP_ENABLED: ${isEnabled || 'not set (default: enabled)'}`);
    console.log(`Current role: ${localStorage.getItem('WEBMCP_ROLE') || 'not set (default: admin)'}`);
  } catch (error) {
    console.error('Error checking configuration:', error.message);
  }
  console.log();

  console.log('%c=== Test Complete ===', 'font-size: 14px; font-weight: bold; color: #0066cc');
  console.log('Available debug commands:');
  console.log('  window.webmcp.tools()                              - List all tools');
  console.log('  window.webmcp.executeTool(name, args)             - Execute a tool');
  console.log('  window.webmcp.auditLogs()                         - View audit log');
  console.log('  window.webmcp.clearAuditLogs()                    - Clear audit log');
  console.log('  localStorage.getItem("WEBMCP_ENABLED")            - Check if enabled');
  console.log('  localStorage.setItem("WEBMCP_ROLE", "admin")      - Set role');
})();
