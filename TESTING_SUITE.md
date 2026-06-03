# Testing Suite - OXXO Movilidad Dashboard

**Objetivo**: Validar bugs, performance, estabilidad y experiencia de usuario

---

## 📋 Plan de Testing

### FASE 1: Performance & Load Testing
- [ ] Lighthouse audit (speed, accessibility, SEO, best practices)
- [ ] Memory leak detection (prolonged usage)
- [ ] CPU usage monitoring (setInterval optimization validation)
- [ ] DOM query performance (querySelectorAll caching validation)
- [ ] File upload stress test (large CSV/XLSX files)

### FASE 2: Functional Testing
- [ ] File upload/parsing (CSV, XLSX)
- [ ] Data filtering & sorting
- [ ] Chart rendering & interactivity
- [ ] Dark mode toggle
- [ ] Export functionality (CSV, PDF, Email)
- [ ] LocalStorage persistence
- [ ] Tab navigation & switching

### FASE 3: Stress Testing
- [ ] Large dataset handling (10K+ rows)
- [ ] Rapid tab switching (100+ clicks)
- [ ] Concurrent operations (upload + filter + export)
- [ ] Window resize/zoom handling
- [ ] Browser back/forward navigation
- [ ] Memory under sustained load (30+ minutes)

### FASE 4: Bug Detection
- [ ] Serial number formatting (scientific notation)
- [ ] Alert notification timing (5 seconds)
- [ ] KPI color reactivity (verde/amarillo/rojo)
- [ ] Dropdown menu closure
- [ ] Form validation
- [ ] Error handling & recovery

### FASE 5: Cross-Browser Testing
- [ ] Chrome/Chromium (primary)
- [ ] Firefox
- [ ] Edge
- [ ] Safari (if available)
- [ ] Mobile browsers (responsive)

---

## 🧪 Test Cases (Automated)

### T1: Performance Baseline
```
Input: Fresh page load with default CSV file
Metrics: 
  - Time to Interactive (TTI) < 3s
  - First Contentful Paint (FCP) < 1.5s
  - Largest Contentful Paint (LCP) < 2.5s
  - Memory usage < 100MB
```

### T2: Large File Upload
```
Input: XLSX file with 10,000 rows
Expected:
  - Parse time < 5 seconds
  - No memory leak after parse
  - UI remains responsive
  - All rows visible in table
```

### T3: Rapid Tab Switching
```
Input: Click through tabs 100 times rapidly
Expected:
  - No UI lag/jank
  - All data loads correctly
  - Memory doesn't grow unbounded
  - Charts render correctly
```

### T4: Data Filtering Stress
```
Input: Apply/remove filters 50 times
Expected:
  - Consistent filter results
  - No data loss
  - Performance doesn't degrade
  - Memory stable
```

### T5: Export Concurrent Operations
```
Input: Trigger CSV + PDF + Email exports simultaneously
Expected:
  - All exports complete
  - No file corruption
  - No browser freeze
  - Proper error handling
```

### T6: Memory Leak Detection
```
Input: Run application for 30 minutes with periodic interactions
Metrics:
  - Memory stable (no growth > 10MB per minute)
  - CPU usage < 20% idle
  - No console errors
  - All features still responsive
```

### T7: Serial Number Formatting
```
Input: Upload file with large serial numbers (2.51125E+13)
Expected:
  - Displayed as full number (2511250000000)
  - Not in scientific notation
  - Correct in exports
```

### T8: Alert Notification Timing
```
Input: Load new file
Expected:
  - Alert appears immediately
  - Alert disappears after 5 seconds
  - Alert doesn't reappear (until new data)
  - Only shows once per data load
```

### T9: KPI Color Reactivity
```
Input: Load file with different availability percentages
Expected:
  - HH % ≥98% → GREEN
  - HH % 95-97% → YELLOW
  - HH % <95% → RED
  - TT % follows same rules
  - Colors update on filter change
```

### T10: Dark Mode Persistence
```
Input: Enable dark mode, reload page
Expected:
  - Dark mode persists
  - All colors correct in dark mode
  - No visual glitches
  - Charts readable
```

---

## 🔧 Test Tools & Methods

### Automated Testing
1. **Lighthouse** - Performance audits
2. **Chrome DevTools** - Memory profiling, performance monitoring
3. **Custom JavaScript** - Stress test scripts
4. **Browser Automation** - Puppeteer/Playwright

### Manual Testing
1. **DevTools Performance** - Real-time monitoring
2. **Network throttling** - Slow network simulation
3. **Device emulation** - Mobile/tablet testing
4. **User interaction** - Click/type/scroll

---

## 📊 Success Criteria

All tests must meet:
- ✅ No crashes or errors
- ✅ Memory stable (<150MB)
- ✅ CPU idle <5%, active <30%
- ✅ UI responsive (no lag >100ms)
- ✅ All data correct after operations
- ✅ Features work in all tested browsers

---

## 🎯 Expected Issues to Catch

1. Memory leaks from event listeners
2. Unoptimized DOM queries
3. Excessive reflows/repaints
4. Uncaught exceptions
5. Race conditions in async operations
6. Data corruption in exports
7. UI freezing under load
8. Incorrect formatting
9. Timing issues (alerts, timeouts)
10. Browser compatibility issues

---

## 📈 Metrics to Track

- Page load time (TTI, FCP, LCP)
- Memory usage (baseline, peak, sustained)
- CPU usage (idle, active)
- JavaScript execution time
- DOM operation time
- Network requests
- Console errors/warnings
- Frame rate (for animations)
- Interaction responsiveness

---

## ✅ Testing Execution Order

1. Start fresh browser session
2. Open DevTools (Performance tab)
3. Take memory baseline
4. Execute each test in sequence
5. Monitor metrics
6. Document results
7. Check for errors/warnings
8. Test again after code changes

---

**Status**: READY FOR EXECUTION
**Estimated Time**: 2-3 hours full suite
**Environment**: Chrome/DevTools + manual interaction
