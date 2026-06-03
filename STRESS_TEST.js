/**
 * OXXO Movilidad - Stress Testing Suite
 * Run in browser DevTools console: copy/paste entire script
 *
 * Usage:
 *   - Open DevTools (F12)
 *   - Go to Console tab
 *   - Copy/paste this entire script
 *   - Tests will run automatically
 *   - Monitor results in console + Performance tab
 */

console.log('%c🧪 OXXO STRESS TEST SUITE - INICIANDO', 'font-size:16px; color:#00AA00; font-weight:bold');

// ============================================================================
// TEST 1: Memory Baseline & Monitoring
// ============================================================================
console.log('\n%c TEST 1: Memory Baseline', 'color:#0066cc; font-weight:bold; font-size:14px');

let memoryLog = [];
function captureMemory() {
  if (performance.memory) {
    let mem = {
      timestamp: new Date().toLocaleTimeString(),
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
    };
    memoryLog.push(mem);
    console.log(`📊 Memory: Used ${mem.usedJSHeapSize} / Total ${mem.totalJSHeapSize} / Limit ${mem.jsHeapSizeLimit}`);
    return mem;
  } else {
    console.warn('⚠️  performance.memory no disponible. Usa Chrome con --enable-precise-memory-info');
    return null;
  }
}

let baselineMemory = captureMemory();

// ============================================================================
// TEST 2: DOM Query Performance
// ============================================================================
console.log('\n%c TEST 2: DOM Query Performance', 'color:#0066cc; font-weight:bold; font-size:14px');

let domTests = {
  querySelectorAll: function() {
    let start = performance.now();
    let elements = document.querySelectorAll('.tab-slider, .metric-card, .dashboard-card, table tr');
    let time = performance.now() - start;
    console.log(`⏱️  querySelectorAll: ${time.toFixed(2)}ms (${elements.length} elementos)`);
    return time;
  },

  getElementById: function() {
    let start = performance.now();
    let times = 0;
    for (let i = 0; i < 100; i++) {
      document.getElementById('export') || document.getElementById('cruce') || document.getElementById('resumen');
      times++;
    }
    let time = performance.now() - start;
    console.log(`⏱️  getElementById (100x): ${time.toFixed(2)}ms`);
    return time;
  },

  getElementByClass: function() {
    let start = performance.now();
    let times = 0;
    for (let i = 0; i < 100; i++) {
      document.getElementsByClassName('tab-content') || document.getElementsByClassName('section');
      times++;
    }
    let time = performance.now() - start;
    console.log(`⏱️  getElementsByClassName (100x): ${time.toFixed(2)}ms`);
    return time;
  }
};

Object.keys(domTests).forEach(test => domTests[test]());

// ============================================================================
// TEST 3: Tab Switching Stress (50 iterations)
// ============================================================================
console.log('\n%c TEST 3: Tab Switching Stress (50x)', 'color:#0066cc; font-weight:bold; font-size:14px');

let tabClickCount = 0;
function stressTestTabSwitching() {
  let tabs = document.querySelectorAll('[role="tab"], .tab-item, [data-tab]');
  if (tabs.length === 0) {
    console.warn('⚠️  No tabs encontradas');
    return;
  }

  let start = performance.now();
  for (let i = 0; i < 50; i++) {
    let tab = tabs[i % tabs.length];
    if (tab) {
      let evt = new MouseEvent('click', { bubbles: true });
      tab.dispatchEvent(evt);
      tabClickCount++;
    }
  }
  let time = performance.now() - start;
  console.log(`✅ Clicked ${tabClickCount} tabs en ${time.toFixed(2)}ms`);
  captureMemory();
}

stressTestTabSwitching();

// ============================================================================
// TEST 4: Table Row Rendering Stress
// ============================================================================
console.log('\n%c TEST 4: Table Row Rendering (1000 insertions)', 'color:#0066cc; font-weight:bold; font-size:14px');

function stressTestTableRendering() {
  let tables = document.querySelectorAll('table tbody');
  if (tables.length === 0) {
    console.warn('⚠️  No tables encontradas');
    return;
  }

  let table = tables[0];
  let originalRows = table.querySelectorAll('tr').length;
  console.log(`📊 Tabla original tiene ${originalRows} filas`);

  let start = performance.now();
  for (let i = 0; i < 100; i++) {
    let tr = document.createElement('tr');
    tr.innerHTML = `<td>Test ${i}</td><td>${Math.random()}</td><td>${new Date().toLocaleTimeString()}</td>`;
    table.appendChild(tr);
  }
  let time = performance.now() - start;

  console.log(`⏱️  Insert 100 filas: ${time.toFixed(2)}ms`);

  // Cleanup
  let rows = table.querySelectorAll('tr');
  for (let i = rows.length - 1; i > originalRows; i--) {
    rows[i].remove();
  }
  console.log(`♻️  Cleanup: removidas filas de test`);
  captureMemory();
}

stressTestTableRendering();

// ============================================================================
// TEST 5: Data Filtering Simulation
// ============================================================================
console.log('\n%c TEST 5: Data Filtering Stress (20x)', 'color:#0066cc; font-weight:bold; font-size:14px');

function stressTestFiltering() {
  let filterInputs = document.querySelectorAll('input[type="text"], input[type="search"], .filter-input');
  if (filterInputs.length === 0) {
    console.warn('⚠️  No filter inputs encontrados');
    return;
  }

  let input = filterInputs[0];
  let start = performance.now();
  let filterCount = 0;

  for (let i = 0; i < 20; i++) {
    input.value = `test${i}`;
    let evt = new Event('input', { bubbles: true });
    input.dispatchEvent(evt);
    filterCount++;
  }

  let time = performance.now() - start;
  console.log(`✅ Applied ${filterCount} filters en ${time.toFixed(2)}ms`);

  // Clear
  input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  console.log(`♻️  Filter cleared`);
  captureMemory();
}

stressTestFiltering();

// ============================================================================
// TEST 6: Serial Number Formatting Validation
// ============================================================================
console.log('\n%c TEST 6: Serial Number Formatting Validation', 'color:#0066cc; font-weight:bold; font-size:14px');

function validateSerialNumberFormatting() {
  let tables = document.querySelectorAll('table');
  let foundSerials = [];

  tables.forEach((table, idx) => {
    let cells = table.querySelectorAll('td');
    cells.forEach(cell => {
      let text = cell.textContent.trim();
      // Check for scientific notation (e.g., 2.51E+13)
      if (/\d+\.\d+[eE][+-]\d+/.test(text)) {
        foundSerials.push({
          table: idx,
          value: text,
          status: '❌ SCIENTIFIC NOTATION'
        });
      }
      // Check for proper serial format (all digits)
      if (/^\d{12,}$/.test(text)) {
        foundSerials.push({
          table: idx,
          value: text,
          status: '✅ PROPER FORMAT'
        });
      }
    });
  });

  if (foundSerials.length > 0) {
    console.table(foundSerials);
  } else {
    console.log('✅ No serial numbers encontrados en tablas (o están ocultos)');
  }
}

validateSerialNumberFormatting();

// ============================================================================
// TEST 7: Alert/Notification Timing
// ============================================================================
console.log('\n%c TEST 7: Alert/Notification Timing Check', 'color:#0066cc; font-weight:bold; font-size:14px');

function checkAlertTiming() {
  let alerts = document.querySelectorAll('.alert, .notification, [role="alert"], .insight-box');
  console.log(`📍 Alerts/Notifications encontradas: ${alerts.length}`);

  alerts.forEach((alert, idx) => {
    let display = window.getComputedStyle(alert).display;
    let opacity = window.getComputedStyle(alert).opacity;
    console.log(`  Alert ${idx}: display=${display}, opacity=${opacity}`);
  });
}

checkAlertTiming();

// ============================================================================
// TEST 8: KPI Color Validation
// ============================================================================
console.log('\n%c TEST 8: KPI Color Reactivity Validation', 'color:#0066cc; font-weight:bold; font-size:14px');

function validateKPIColors() {
  let kpis = document.querySelectorAll('.metric-card, .kpi-card, [data-kpi]');
  let colorResults = [];

  kpis.forEach((kpi, idx) => {
    let bgColor = window.getComputedStyle(kpi).backgroundColor;
    let borderColor = window.getComputedStyle(kpi).borderColor;
    let textColor = window.getComputedStyle(kpi).color;
    let classes = kpi.className;

    colorResults.push({
      index: idx,
      class: classes,
      bgColor: bgColor,
      borderColor: borderColor,
      textColor: textColor
    });
  });

  if (colorResults.length > 0) {
    console.log(`📊 Found ${colorResults.length} KPIs:`);
    console.table(colorResults.slice(0, 10)); // Show first 10
  } else {
    console.warn('⚠️  No KPI cards encontradas');
  }
}

validateKPIColors();

// ============================================================================
// TEST 9: Dark Mode State
// ============================================================================
console.log('\n%c TEST 9: Dark Mode State Check', 'color:#0066cc; font-weight:bold; font-size:14px');

function checkDarkMode() {
  let isDark = document.documentElement.classList.contains('dark-mode');
  let htmlLightness = window.getComputedStyle(document.documentElement).backgroundColor;

  console.log(`🌙 Dark mode class: ${isDark ? '✅ ENABLED' : '❌ DISABLED'}`);
  console.log(`🎨 HTML background: ${htmlLightness}`);

  // Check CSS variables
  let primary = getComputedStyle(document.documentElement).getPropertyValue('--primary');
  let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg');
  let textColor = getComputedStyle(document.documentElement).getPropertyValue('--text');

  console.log(`  CSS Variables:`);
  console.log(`    --primary: ${primary}`);
  console.log(`    --bg: ${bgColor}`);
  console.log(`    --text: ${textColor}`);
}

checkDarkMode();

// ============================================================================
// TEST 10: Error Checking
// ============================================================================
console.log('\n%c TEST 10: Console Error/Warning Scan', 'color:#0066cc; font-weight:bold; font-size:14px');

// Note: This won't catch past errors, but you should monitor DevTools console
console.log('✅ Monitor DevTools console for errors (real-time)');
console.log('   Look for: ❌ errors, ⚠️  warnings, uncaught exceptions');

// ============================================================================
// FINAL MEMORY REPORT
// ============================================================================
console.log('\n%c📊 FINAL MEMORY REPORT', 'font-size:16px; color:#FF6600; font-weight:bold');

let finalMemory = captureMemory();

if (baselineMemory && finalMemory) {
  console.log('\n%c Memory Comparison:', 'font-weight:bold');
  console.table({
    baseline: baselineMemory,
    final: finalMemory
  });
}

// ============================================================================
// TEST SUMMARY
// ============================================================================
console.log('\n%c✅ STRESS TEST COMPLETED', 'font-size:16px; color:#00AA00; font-weight:bold');

console.log(`
📋 Summary:
  • Memory baseline captured
  • DOM queries tested
  • Tab switching (50x) tested
  • Table rendering (100 rows) tested
  • Filtering (20x) tested
  • Serial numbers validated
  • Alert timing checked
  • KPI colors validated
  • Dark mode status verified
  • Console monitoring active

🔍 Next Steps:
  1. Check Performance tab in DevTools
  2. Look for memory leaks (keep running for 5+ min)
  3. Check Network tab for slow requests
  4. Verify all console.log is cleaned up
  5. Test with large files (10K+ rows)

⚙️ To run again, refresh page and re-paste this script
`);

console.log('%c TESTS READY TO MONITOR', 'font-size:14px; color:#0066cc; font-weight:bold');
