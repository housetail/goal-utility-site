/**
 * 初始化页面后续流程。
 * - 加载汇率数据
 * - 绑定三个工具的事件处理
 */
document.addEventListener('DOMContentLoaded', () => {
  initializeFxTool();
  initializeMortgageTool();
  initializeTravelTool();
});

/**
 * 获取并填充汇率下拉列表，同时处理换算逻辑。
 */
function initializeFxTool() {
  const form = document.getElementById('fx-form');
  const fromSelect = document.getElementById('fx-from');
  const toSelect = document.getElementById('fx-to');
  const resultEl = document.getElementById('fx-result');

  fetch('https://api.exchangerate.host/latest')
    .then((response) => response.json())
    .then((data) => {
      const currencies = Object.keys(data.rates).sort();
      currencies.forEach((code) => {
        fromSelect.add(new Option(code, code));
        toSelect.add(new Option(code, code));
      });
      fromSelect.value = 'USD';
      toSelect.value = 'CNY';
      updateFxResult(resultEl, '请选择货币并输入金额进行换算。');
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        handleFxConversion(data.rates, resultEl);
      });
    })
    .catch(() => {
      updateFxResult(resultEl, '汇率数据加载失败，请稍后再试。');
    });
}

/**
 * 根据汇率数据执行换算并输出结果。
 * @param {Record<string, number>} rates 汇率表
 * @param {HTMLElement} resultEl 输出区域
 */
function handleFxConversion(rates, resultEl) {
  const amount = parseFloat(document.getElementById('fx-amount').value);
  const from = document.getElementById('fx-from').value;
  const to = document.getElementById('fx-to').value;

  if (!rates[from] || !rates[to]) {
    updateFxResult(resultEl, '暂不支持所选货币组合。');
    return;
  }

  const baseAmount = amount / rates[from];
  const converted = baseAmount * rates[to];
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: to,
  });

  updateFxResult(
    resultEl,
    `${amount.toFixed(2)} ${from} ≈ ${formatter.format(converted)}\n` +
      `汇率更新时间：${new Date().toLocaleString('zh-CN')}`,
  );
}

/**
 * 更新汇率结果显示内容。
 * @param {HTMLElement} element 输出容器
 * @param {string} message 显示文字
 */
function updateFxResult(element, message) {
  element.textContent = message;
}

/**
 * 初始化房贷计算工具。
 */
function initializeMortgageTool() {
  const form = document.getElementById('mortgage-form');
  const resultEl = document.getElementById('mortgage-result');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const principal = Number(document.getElementById('mortgage-principal').value);
    const annualRate = Number(document.getElementById('mortgage-rate').value) / 100;
    const years = Number(document.getElementById('mortgage-years').value);
    const months = years * 12;
    const monthlyRate = annualRate / 12;

    if (monthlyRate === 0) {
      const payment = principal / months;
      const total = payment * months;
      const interest = total - principal;
      renderMortgageResult(resultEl, payment, total, interest);
      return;
    }

    const factor = Math.pow(1 + monthlyRate, months);
    const payment = (principal * monthlyRate * factor) / (factor - 1);
    const total = payment * months;
    const interest = total - principal;
    renderMortgageResult(resultEl, payment, total, interest);
  });
}

/**
 * 输出房贷计算结果。
 * @param {HTMLElement} element 输出容器
 * @param {number} monthly 月供
 * @param {number} total 总还款
 * @param {number} interest 总利息
 */
function renderMortgageResult(element, monthly, total, interest) {
  element.innerHTML = `
    <p>每月月供：<strong>${formatCurrency(monthly)}</strong></p>
    <p>总还款：<strong>${formatCurrency(total)}</strong></p>
    <p>总利息：<strong>${formatCurrency(interest)}</strong></p>
  `;
}

/**
 * 初始化旅行预算规划工具。
 */
function initializeTravelTool() {
  const form = document.getElementById('travel-form');
  const resultEl = document.getElementById('travel-result');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const days = Number(document.getElementById('travel-days').value);
    const persons = Number(document.getElementById('travel-persons').value);
    const daily = Number(document.getElementById('travel-daily').value);
    const emergencyRate = Number(document.getElementById('travel-emergency').value) / 100;

    const baseBudget = days * persons * daily;
    const emergencyFund = baseBudget * emergencyRate;
    const totalBudget = baseBudget + emergencyFund;
    const perPerson = totalBudget / persons;

    renderTravelResult(resultEl, {
      baseBudget,
      emergencyFund,
      totalBudget,
      perPerson,
    });
  });
}

/**
 * 渲染旅行预算结果。
 * @param {HTMLElement} element 输出容器
 * @param {{ baseBudget: number; emergencyFund: number; totalBudget: number; perPerson: number }} payload 预算结果
 */
function renderTravelResult(element, payload) {
  const { baseBudget, emergencyFund, totalBudget, perPerson } = payload;
  element.innerHTML = `
    <p>基础预算：<strong>${formatCurrency(baseBudget)}</strong></p>
    <p>应急金：<strong>${formatCurrency(emergencyFund)}</strong></p>
    <p>总预算：<strong>${formatCurrency(totalBudget)}</strong></p>
    <p>人均费用：<strong>${formatCurrency(perPerson)}</strong></p>
  `;
}

/**
 * 将数字格式化为人民币风格货币。
 * @param {number} value 数值
 * @returns {string} 格式化结果
 */
function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value);
}
