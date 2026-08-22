// ============================================================
// House Recommendation System — Canvas Charts
// Bar, Scatter, Donut charts with animations
// ============================================================

(function () {
  "use strict";

  // ── Color Palette ──
  const CHART_COLORS = [
    "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#6366f1"
  ];

  const CHART_BG = "rgba(15, 15, 30, 0.0)";
  const GRID_COLOR = "rgba(255, 255, 255, 0.08)";
  const TEXT_COLOR = "rgba(255, 255, 255, 0.7)";
  const AXIS_COLOR = "rgba(255, 255, 255, 0.15)";

  // ── Utility: Get device pixel ratio ──
  function getDPR() {
    return window.devicePixelRatio || 1;
  }

  // ── Utility: Setup canvas for HiDPI ──
  function setupCanvas(canvas) {
    const dpr = getDPR();
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  }

  // ── Utility: Ease-out animation ──
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // ── Format large numbers for axis ──
  function formatAxisValue(val) {
    if (val >= 10000000) return (val / 10000000).toFixed(1) + "Cr";
    if (val >= 100000) return (val / 100000).toFixed(0) + "L";
    if (val >= 1000) return (val / 1000).toFixed(0) + "K";
    return val.toString();
  }

  // ════════════════════════════════════════════════════════════
  // BAR CHART — Price Distribution by Location
  // ════════════════════════════════════════════════════════════
  function drawBarChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    const {
      title = "",
      labelKey = "label",
      valueKey = "value",
      barColor = null,
      animate = true
    } = options;

    const padding = { top: 40, right: 20, bottom: 60, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...data.map(d => d[valueKey])) * 1.15;
    const barWidth = Math.min(40, (chartW / data.length) * 0.6);
    const barGap = (chartW - barWidth * data.length) / (data.length + 1);

    function draw(progress) {
      ctx.clearRect(0, 0, width, height);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, width / 2, 24);

      // Grid lines
      const gridLines = 5;
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartH / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        // Y-axis labels
        const val = maxVal * (1 - i / gridLines);
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(formatAxisValue(val), padding.left - 8, y + 4);
      }
      ctx.setLineDash([]);

      // Axes
      ctx.strokeStyle = AXIS_COLOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, height - padding.bottom);
      ctx.lineTo(width - padding.right, height - padding.bottom);
      ctx.stroke();

      // Bars
      data.forEach((d, i) => {
        const x = padding.left + barGap + i * (barWidth + barGap);
        const barH = (d[valueKey] / maxVal) * chartH * progress;
        const y = height - padding.bottom - barH;

        // Gradient fill
        const gradient = ctx.createLinearGradient(x, y, x, height - padding.bottom);
        const color = barColor || CHART_COLORS[i % CHART_COLORS.length];
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + "44");
        ctx.fillStyle = gradient;

        // Rounded top corners
        const radius = Math.min(4, barWidth / 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height - padding.bottom);
        ctx.lineTo(x, height - padding.bottom);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Value on top of bar
        if (progress > 0.8) {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px 'Inter', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(formatAxisValue(d[valueKey]), x + barWidth / 2, y - 6);
        }

        // X-axis labels
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "10px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.save();
        ctx.translate(x + barWidth / 2, height - padding.bottom + 12);
        ctx.rotate(-0.4);
        ctx.fillText(d[labelKey], 0, 0);
        ctx.restore();
      });
    }

    if (animate) {
      let startTime = null;
      function animateFrame(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, easeOutCubic(elapsed / 1200));
        draw(progress);
        if (progress < 1) requestAnimationFrame(animateFrame);
      }
      requestAnimationFrame(animateFrame);
    } else {
      draw(1);
    }
  }

  // ════════════════════════════════════════════════════════════
  // SCATTER PLOT — Price vs Area
  // ════════════════════════════════════════════════════════════
  function drawScatterPlot(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    const {
      title = "",
      xKey = "x",
      yKey = "y",
      labelKey = "label",
      colorKey = "color",
      animate = true
    } = options;

    const padding = { top: 40, right: 20, bottom: 50, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const xValues = data.map(d => d[xKey]);
    const yValues = data.map(d => d[yKey]);
    const xMin = Math.min(...xValues) * 0.9;
    const xMax = Math.max(...xValues) * 1.1;
    const yMin = Math.min(...yValues) * 0.9;
    const yMax = Math.max(...yValues) * 1.1;

    // Map data coords to canvas
    function mapX(val) {
      return padding.left + ((val - xMin) / (xMax - xMin)) * chartW;
    }
    function mapY(val) {
      return height - padding.bottom - ((val - yMin) / (yMax - yMin)) * chartH;
    }

    function draw(progress) {
      ctx.clearRect(0, 0, width, height);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, width / 2, 24);

      // Grid
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        const val = yMax - (yMax - yMin) * (i / 5);
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "11px 'Inter', sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(formatAxisValue(val), padding.left - 8, y + 4);
      }
      ctx.setLineDash([]);

      // Axes
      ctx.strokeStyle = AXIS_COLOR;
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, height - padding.bottom);
      ctx.lineTo(width - padding.right, height - padding.bottom);
      ctx.stroke();

      // X-axis labels
      for (let i = 0; i <= 5; i++) {
        const val = xMin + (xMax - xMin) * (i / 5);
        const x = mapX(val);
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "10px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(formatAxisValue(val), x, height - padding.bottom + 20);
      }

      // Axis titles
      ctx.fillStyle = TEXT_COLOR;
      ctx.font = "11px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Area (sq.ft)", width / 2, height - 8);

      ctx.save();
      ctx.translate(14, height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("Price (₹)", 0, 0);
      ctx.restore();

      // Data points
      const pointsToShow = Math.floor(data.length * progress);
      for (let i = 0; i < pointsToShow; i++) {
        const d = data[i];
        const x = mapX(d[xKey]);
        const y = mapY(d[yKey]);
        const color = d[colorKey] || CHART_COLORS[i % CHART_COLORS.length];
        const radius = 5 + (d.bhk || 2) * 1.2;

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color + "cc";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.shadowBlur = 0;
      }
    }

    if (animate) {
      let startTime = null;
      function animateFrame(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, easeOutCubic(elapsed / 1500));
        draw(progress);
        if (progress < 1) requestAnimationFrame(animateFrame);
      }
      requestAnimationFrame(animateFrame);
    } else {
      draw(1);
    }
  }

  // ════════════════════════════════════════════════════════════
  // DONUT CHART — BHK Distribution / Property Type Distribution
  // ════════════════════════════════════════════════════════════
  function drawDonutChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    const {
      title = "",
      labelKey = "label",
      valueKey = "value",
      animate = true
    } = options;

    const centerX = width / 2;
    const centerY = height / 2 + 10;
    const outerRadius = Math.min(width, height) / 2 - 45;
    const innerRadius = outerRadius * 0.55;
    const total = data.reduce((sum, d) => sum + d[valueKey], 0);

    function draw(progress) {
      ctx.clearRect(0, 0, width, height);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px 'Inter', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(title, width / 2, 24);

      let startAngle = -Math.PI / 2;

      data.forEach((d, i) => {
        const sliceAngle = (d[valueKey] / total) * Math.PI * 2 * progress;
        const endAngle = startAngle + sliceAngle;
        const color = CHART_COLORS[i % CHART_COLORS.length];

        // Draw slice
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Slice border
        ctx.strokeStyle = "rgba(15, 15, 30, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label line and text
        if (progress > 0.8 && sliceAngle > 0.15) {
          const midAngle = startAngle + sliceAngle / 2;
          const labelRadius = outerRadius + 18;
          const lx = centerX + Math.cos(midAngle) * labelRadius;
          const ly = centerY + Math.sin(midAngle) * labelRadius;

          ctx.fillStyle = TEXT_COLOR;
          ctx.font = "11px 'Inter', sans-serif";
          ctx.textAlign = Math.cos(midAngle) > 0 ? "left" : "right";
          ctx.fillText(`${d[labelKey]} (${Math.round(d[valueKey] / total * 100)}%)`, lx, ly);
        }

        startAngle = endAngle;
      });

      // Center text
      if (progress > 0.5) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px 'Inter', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(total, centerX, centerY - 4);
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = "11px 'Inter', sans-serif";
        ctx.fillText("Total", centerX, centerY + 16);
      }
    }

    if (animate) {
      let startTime = null;
      function animateFrame(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, easeOutCubic(elapsed / 1200));
        draw(progress);
        if (progress < 1) requestAnimationFrame(animateFrame);
      }
      requestAnimationFrame(animateFrame);
    } else {
      draw(1);
    }
  }

  // ── Intersection Observer for triggering chart animations ──
  function observeChart(canvasId, drawFn) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    let drawn = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !drawn) {
          drawn = true;
          drawFn();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(canvas);
  }

  // ── Export ──
  window.Charts = {
    drawBarChart,
    drawScatterPlot,
    drawDonutChart,
    observeChart
  };
})();
