// ===========================================================
// FitCalcHub shared behaviour: nav, FAQ accordions, calculators
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFaq();
  initSegmented();
  initTdeeCalculator();
  initBmiCalculator();
  initBodyFatCalculator();
  initMealCalculator();
});

/* ---------------- Mobile nav ---------------- */
function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-nav');
  if(!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

/* ---------------- FAQ accordion ---------------- */
function initFaq(){
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!isOpen) item.classList.add('open');
    });
  });
}

/* ---------------- Generic segmented control (unit switches) ---------------- */
function initSegmented(){
  document.querySelectorAll('.seg').forEach(seg => {
    seg.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        seg.dispatchEvent(new CustomEvent('change', { detail: btn.dataset.value }));
      });
    });
  });
}

function getSegValue(seg){
  const active = seg.querySelector('button.active');
  return active ? active.dataset.value : null;
}

function setFieldError(field, msg){
  field.classList.toggle('has-error', !!msg);
  const err = field.querySelector('.error-msg');
  if(err) err.textContent = msg || '';
}

function toNumber(v){
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : NaN;
}

/* ---------------- Height helpers (cm <-> ft/in) ---------------- */
function heightToCm(unit, cmVal, ftVal, inVal){
  if(unit === 'cm') return toNumber(cmVal);
  const ft = toNumber(ftVal) || 0;
  const inch = toNumber(inVal) || 0;
  if(!ft && !inch) return NaN;
  return (ft * 30.48) + (inch * 2.54);
}
function weightToKg(unit, val){
  const n = toNumber(val);
  if(!Number.isFinite(n)) return NaN;
  return unit === 'kg' ? n : n * 0.45359237;
}

/* =========================================================
   TDEE CALCULATOR
========================================================= */
function initTdeeCalculator(){
  const form = document.getElementById('tdee-form');
  if(!form) return;

  const weightUnitSeg = document.getElementById('tdee-weight-unit');
  const heightUnitSeg = document.getElementById('tdee-height-unit');
  const heightCmWrap = document.getElementById('tdee-height-cm-wrap');
  const heightFtWrap = document.getElementById('tdee-height-ft-wrap');
  const weightUnitLabel = document.getElementById('tdee-weight-unit-label');

  weightUnitSeg.addEventListener('change', e => {
    weightUnitLabel.textContent = e.detail;
  });
  heightUnitSeg.addEventListener('change', e => {
    const isCm = e.detail === 'cm';
    heightCmWrap.style.display = isCm ? 'flex' : 'none';
    heightFtWrap.style.display = isCm ? 'none' : 'flex';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const genderField = document.getElementById('tdee-gender-field');
    const ageField = document.getElementById('tdee-age-field');
    const weightField = document.getElementById('tdee-weight-field');
    const heightField = document.getElementById('tdee-height-field');

    const gender = document.getElementById('tdee-gender').value;
    const age = toNumber(document.getElementById('tdee-age').value);
    const weightUnit = getSegValue(weightUnitSeg);
    const weightRaw = document.getElementById('tdee-weight').value;
    const heightUnit = getSegValue(heightUnitSeg);
    const heightCm = document.getElementById('tdee-height-cm').value;
    const heightFt = document.getElementById('tdee-height-ft').value;
    const heightIn = document.getElementById('tdee-height-in').value;
    const activity = parseFloat(document.getElementById('tdee-activity').value);

    let valid = true;
    setFieldError(genderField, '');
    if(!gender){ setFieldError(genderField, 'Please select a gender.'); valid = false; }

    if(!age || age < 14 || age > 100){
      setFieldError(ageField, 'Enter an age between 14 and 100.'); valid = false;
    } else setFieldError(ageField, '');

    const weightKg = weightToKg(weightUnit, weightRaw);
    if(!weightKg || weightKg < 25 || weightKg > 300){
      setFieldError(weightField, 'Enter a realistic weight.'); valid = false;
    } else setFieldError(weightField, '');

    const heightCmVal = heightToCm(heightUnit, heightCm, heightFt, heightIn);
    if(!heightCmVal || heightCmVal < 100 || heightCmVal > 250){
      setFieldError(heightField, 'Enter a realistic height.'); valid = false;
    } else setFieldError(heightField, '');

    if(!activity){ valid = false; }

    const resultCard = document.getElementById('tdee-result');
    const goals = document.getElementById('tdee-goals');
    const note = document.getElementById('tdee-note');
    if(!valid){ resultCard.classList.remove('show'); goals.style.display='none'; note.style.display='none'; return; }

    const bmr = gender === 'male'
      ? (10 * weightKg) + (6.25 * heightCmVal) - (5 * age) + 5
      : (10 * weightKg) + (6.25 * heightCmVal) - (5 * age) - 161;

    const tdee = bmr * activity;

    document.getElementById('tdee-value').textContent = Math.round(tdee).toLocaleString() + ' calories/day';
    document.getElementById('bmr-value').textContent = Math.round(bmr).toLocaleString() + ' calories/day';
    document.getElementById('goal-loss').textContent = Math.round(tdee - 500).toLocaleString();
    document.getElementById('goal-maintain').textContent = Math.round(tdee).toLocaleString();
    document.getElementById('goal-gain').textContent = Math.round(tdee + 500).toLocaleString();

    resultCard.classList.add('show');
    goals.style.display = 'grid';
    note.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* =========================================================
   BMI CALCULATOR
========================================================= */
function initBmiCalculator(){
  const form = document.getElementById('bmi-form');
  if(!form) return;

  const weightUnitSeg = document.getElementById('bmi-weight-unit');
  const heightUnitSeg = document.getElementById('bmi-height-unit');
  const heightCmWrap = document.getElementById('bmi-height-cm-wrap');
  const heightFtWrap = document.getElementById('bmi-height-ft-wrap');

  heightUnitSeg.addEventListener('change', e => {
    const isCm = e.detail === 'cm';
    heightCmWrap.style.display = isCm ? 'flex' : 'none';
    heightFtWrap.style.display = isCm ? 'none' : 'flex';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const weightField = document.getElementById('bmi-weight-field');
    const heightField = document.getElementById('bmi-height-field');

    const weightUnit = getSegValue(weightUnitSeg);
    const weightRaw = document.getElementById('bmi-weight').value;
    const heightUnit = getSegValue(heightUnitSeg);
    const heightCm = document.getElementById('bmi-height-cm').value;
    const heightFt = document.getElementById('bmi-height-ft').value;
    const heightIn = document.getElementById('bmi-height-in').value;

    let valid = true;
    const weightKg = weightToKg(weightUnit, weightRaw);
    if(!weightKg || weightKg <= 0 || weightKg > 300){
      setFieldError(weightField, 'Enter a realistic weight.'); valid = false;
    } else setFieldError(weightField, '');

    const heightCmVal = heightToCm(heightUnit, heightCm, heightFt, heightIn);
    if(!heightCmVal || heightCmVal <= 0 || heightCmVal > 250){
      setFieldError(heightField, 'Enter a realistic height.'); valid = false;
    } else setFieldError(heightField, '');

    const resultCard = document.getElementById('bmi-result');
    if(!valid){ resultCard.classList.remove('show'); return; }

    const heightM = heightCmVal / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = Math.round(bmi * 10) / 10;

    let category, color;
    if(bmi < 18.5){ category = 'Underweight'; color = '#b5541a'; }
    else if(bmi < 25){ category = 'Healthy Weight'; color = '#0e9b6c'; }
    else if(bmi < 30){ category = 'Overweight'; color = '#b5541a'; }
    else { category = 'Obesity'; color = '#b3372f'; }

    document.getElementById('bmi-value').textContent = bmiRounded;
    const pill = document.getElementById('bmi-category');
    pill.textContent = category;
    pill.style.background = color + '1a';
    pill.style.color = color;

    resultCard.classList.add('show');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* =========================================================
   BODY FAT CALCULATOR (U.S. Navy method)
========================================================= */
function initBodyFatCalculator(){
  const form = document.getElementById('bf-form');
  if(!form) return;

  const genderSeg = document.getElementById('bf-gender');
  const hipField = document.getElementById('bf-hip-field');
  const heightUnitSeg = document.getElementById('bf-height-unit');
  const heightCmWrap = document.getElementById('bf-height-cm-wrap');
  const heightFtWrap = document.getElementById('bf-height-ft-wrap');

  genderSeg.addEventListener('change', e => {
    hipField.style.display = e.detail === 'female' ? 'flex' : 'none';
  });
  heightUnitSeg.addEventListener('change', e => {
    const isCm = e.detail === 'cm';
    heightCmWrap.style.display = isCm ? 'flex' : 'none';
    heightFtWrap.style.display = isCm ? 'none' : 'flex';
  });

  function cmVal(unit, val){
    return unit === 'cm' ? toNumber(val) : toNumber(val) * 2.54;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const gender = getSegValue(genderSeg);
    const unit = getSegValue(document.getElementById('bf-unit'));
    const heightUnit = getSegValue(heightUnitSeg);
    const heightCm = document.getElementById('bf-height-cm').value;
    const heightFt = document.getElementById('bf-height-ft').value;
    const heightIn = document.getElementById('bf-height-in').value;
    const neckRaw = document.getElementById('bf-neck').value;
    const waistRaw = document.getElementById('bf-waist').value;
    const hipRaw = document.getElementById('bf-hip').value;

    const heightCmVal = heightToCm(heightUnit, heightCm, heightFt, heightIn);
    const factor = unit === 'cm' ? 1 : 2.54;
    const neck = toNumber(neckRaw) * factor;
    const waist = toNumber(waistRaw) * factor;
    const hip = toNumber(hipRaw) * factor;

    let valid = true;
    const heightField = document.getElementById('bf-height-field');
    const neckField = document.getElementById('bf-neck-field');
    const waistField = document.getElementById('bf-waist-field');

    if(!heightCmVal || heightCmVal < 100 || heightCmVal > 250){
      setFieldError(heightField, 'Enter a realistic height.'); valid = false;
    } else setFieldError(heightField, '');

    if(!neck || neck <= 0){ setFieldError(neckField, 'Enter your neck measurement.'); valid = false; }
    else setFieldError(neckField, '');

    if(!waist || waist <= 0){ setFieldError(waistField, 'Enter your waist measurement.'); valid = false; }
    else setFieldError(waistField, '');

    if(gender === 'female' && (!hip || hip <= 0)){
      setFieldError(hipField, 'Enter your hip measurement.'); valid = false;
    } else setFieldError(hipField, '');

    const resultCard = document.getElementById('bf-result');
    if(!valid){ resultCard.classList.remove('show'); return; }

    let bfPercent;
    if(gender === 'male'){
      bfPercent = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCmVal)) - 450;
    } else {
      bfPercent = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(heightCmVal)) - 450;
    }
    bfPercent = Math.max(2, Math.min(60, bfPercent));
    const rounded = Math.round(bfPercent * 10) / 10;

    let category, color;
    const ranges = gender === 'male'
      ? [[0,6,'Essential Fat'],[6,14,'Athletic'],[14,18,'Fit'],[18,25,'Average'],[25,100,'Above Average']]
      : [[0,14,'Essential Fat'],[14,21,'Athletic'],[21,25,'Fit'],[25,32,'Average'],[32,100,'Above Average']];
    const match = ranges.find(r => bfPercent >= r[0] && bfPercent < r[1]) || ranges[ranges.length-1];
    category = match[2];
    color = category === 'Athletic' || category === 'Fit' ? '#0e9b6c' : (category === 'Average' ? '#b5541a' : (category === 'Above Average' ? '#b3372f' : '#526059'));

    document.getElementById('bf-value').textContent = rounded + '%';
    const pill = document.getElementById('bf-category');
    pill.textContent = category;
    pill.style.background = color + '1a';
    pill.style.color = color;

    resultCard.classList.add('show');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* =========================================================
   MEAL CALORIE CALCULATOR
========================================================= */
function initMealCalculator(){
  const tbody = document.getElementById('meal-tbody');
  if(!tbody) return;

  const addBtn = document.getElementById('meal-add-btn');
  const resetBtn = document.getElementById('meal-reset-btn');
  let rowId = 0;

  function addRow(prefill){
    rowId++;
    const tr = document.createElement('tr');
    tr.dataset.row = rowId;
    tr.innerHTML = `
      <td data-label="Food"><input type="text" class="m-name" placeholder="e.g. Grilled chicken" value="${prefill?.name || ''}"></td>
      <td data-label="Qty"><input type="number" class="m-qty" min="0" step="1" placeholder="1" value="${prefill?.qty ?? ''}"></td>
      <td data-label="Calories"><input type="number" class="m-cal" min="0" step="1" placeholder="0" value="${prefill?.cal ?? ''}"></td>
      <td data-label="Protein (g)"><input type="number" class="m-protein" min="0" step="1" placeholder="0" value="${prefill?.protein ?? ''}"></td>
      <td data-label="Carbs (g)"><input type="number" class="m-carbs" min="0" step="1" placeholder="0" value="${prefill?.carbs ?? ''}"></td>
      <td data-label="Fat (g)"><input type="number" class="m-fat" min="0" step="1" placeholder="0" value="${prefill?.fat ?? ''}"></td>
      <td data-label=""><button type="button" class="rm-btn" aria-label="Remove food item">&times;</button></td>
    `;
    tbody.appendChild(tr);

    tr.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        if(toNumber(inp.value) < 0) inp.value = 0;
        recalcTotals();
      });
    });
    tr.querySelector('.rm-btn').addEventListener('click', () => {
      tr.remove();
      recalcTotals();
    });
  }

  function recalcTotals(){
    let cal = 0, protein = 0, carbs = 0, fat = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
      const qty = toNumber(tr.querySelector('.m-qty').value) || 1;
      const c = toNumber(tr.querySelector('.m-cal').value) || 0;
      const p = toNumber(tr.querySelector('.m-protein').value) || 0;
      const cb = toNumber(tr.querySelector('.m-carbs').value) || 0;
      const f = toNumber(tr.querySelector('.m-fat').value) || 0;
      cal += c * qty; protein += p * qty; carbs += cb * qty; fat += f * qty;
    });
    document.getElementById('meal-total-cal').textContent = Math.round(cal).toLocaleString() + ' kcal';
    document.getElementById('meal-total-protein').textContent = Math.round(protein) + ' g';
    document.getElementById('meal-total-carbs').textContent = Math.round(carbs) + ' g';
    document.getElementById('meal-total-fat').textContent = Math.round(fat) + ' g';
  }

  addBtn.addEventListener('click', () => addRow());
  resetBtn.addEventListener('click', () => {
    tbody.innerHTML = '';
    addRow(); addRow();
    recalcTotals();
  });

  // Seed with two starter rows
  addRow();
  addRow();
  recalcTotals();
}
