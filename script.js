/*
 * AeroBMI - Intelligent BMI Tracker & Health Planner
 * JavaScript Logic and State Management
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Selectors ---
  const unitMetricBtn = document.getElementById('unit-metric');
  const unitImperialBtn = document.getElementById('unit-imperial');
  
  const sexMaleBtn = document.getElementById('sex-male');
  const sexFemaleBtn = document.getElementById('sex-female');
  
  const ageInput = document.getElementById('age-input');
  const ageSlider = document.getElementById('age-slider');
  
  const heightSlider = document.getElementById('height-slider');
  const heightMetricContainer = document.querySelector('.metric-only.flex-row');
  const heightImperialContainer = document.querySelector('.imperial-only.flex-row');
  const heightMetricInput = document.getElementById('height-metric');
  const heightFeetInput = document.getElementById('height-feet');
  const heightInchesInput = document.getElementById('height-inches');
  
  const weightSlider = document.getElementById('weight-slider');
  const weightMetricContainer = document.querySelector('.metric-only ~ .metric-only'); // Second element or let's use inputs parent
  const weightMetricInput = document.getElementById('weight-metric');
  const weightImperialInput = document.getElementById('weight-imperial');
  
  const saveBtn = document.getElementById('save-btn');
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const historyTbody = document.getElementById('history-tbody');
  const historyCountBadge = document.getElementById('history-count');
  const emptyHistoryState = document.getElementById('empty-history-state');
  
  const bmiValEl = document.getElementById('bmi-val');
  const bmiStatusEl = document.getElementById('bmi-status');
  const idealRangeEl = document.getElementById('ideal-range');
  
  const recommendationsBox = document.getElementById('recommendations-box');
  const insightTitleEl = document.getElementById('insight-title');
  const insightDescEl = document.getElementById('insight-desc');
  const tipNutritionEl = document.getElementById('tip-nutrition');
  const tipExerciseEl = document.getElementById('tip-exercise');
  const gaugeFill = document.getElementById('gauge-fill');

  // Query Height Tick Labels
  const heightTickMin = document.querySelector('#height-slider + .slider-ticks .tick-min');
  const heightTickMax = document.querySelector('#height-slider + .slider-ticks .tick-max');
  
  // Query Weight Tick Labels
  const weightTickMin = document.getElementById('weight-tick-min');
  const weightTickMax = document.getElementById('weight-tick-max');

  // --- App State ---
  let currentUnit = 'metric'; // 'metric' | 'imperial'
  let currentSex = 'male';    // 'male' | 'female'
  let calculatedBMI = 22.9;

  // --- Recommendations Database ---
  const recommendations = {
    underweight: {
      title: "Underweight Nutrition Plan",
      desc: "Your BMI indicates you are underweight. It is important to focus on nutrient-dense meals and consistent eating patterns to reach a healthy weight safely.",
      nutrition: "Increase caloric intake with healthy fats (nuts, avocados, seeds) and clean, lean proteins.",
      exercise: "Focus on moderate strength training to build muscle mass rather than high-intensity cardiovascular work."
    },
    normal: {
      title: "Healthy & Fit",
      desc: "Great job! You are in a healthy weight range. Maintaining this weight reduces your risk of cardiovascular issues, diabetes, and joint strain.",
      nutrition: "Maintain a balanced diet rich in whole foods, colorful vegetables, lean proteins, and fiber.",
      exercise: "Engage in 150 minutes of moderate aerobic workouts weekly, plus two strength training sessions."
    },
    overweight: {
      title: "Overweight Management",
      desc: "Your BMI indicates you are in the overweight range. Small, sustainable adjustments to nutrition and activity can significantly improve metabolic markers.",
      nutrition: "Manage portion sizes, swap processed carbohydrates for high-fiber foods, and stay hydrated.",
      exercise: "Incorporate moderate aerobic exercises (brisk walking, cycling, swimming) for 30-45 minutes daily."
    },
    obese: {
      title: "Health Improvement Plan",
      desc: "Your BMI is in the obese range. Prioritizing physical health through active habit tracking is recommended to reduce risk of diabetes, hypertension, and heart disease.",
      nutrition: "Adhere to a calorie-controlled, whole-food diet, and consider consulting a registered dietitian.",
      exercise: "Start with low-impact exercises like walking, water aerobics, or stationary cycling to protect joints."
    }
  };

  // --- Initialize App ---
  function init() {
    registerEventListeners();
    loadHistory();
    calculateAndUpdate();
  }

  // --- Event Listeners ---
  function registerEventListeners() {
    // Unit Toggles
    unitMetricBtn.addEventListener('click', () => setUnit('metric'));
    unitImperialBtn.addEventListener('click', () => setUnit('imperial'));
    
    // Sex Toggles
    sexMaleBtn.addEventListener('click', () => setSex('male'));
    sexFemaleBtn.addEventListener('click', () => setSex('female'));
    
    // Age input / slider sync
    ageInput.addEventListener('input', () => {
      let val = parseInt(ageInput.value) || 2;
      val = Math.max(2, Math.min(120, val));
      ageSlider.value = val;
      calculateAndUpdate();
    });
    ageSlider.addEventListener('input', () => {
      ageInput.value = ageSlider.value;
      calculateAndUpdate();
    });
    
    // Height inputs / slider sync
    heightSlider.addEventListener('input', () => {
      syncHeightFromSlider();
      calculateAndUpdate();
    });
    heightMetricInput.addEventListener('input', () => {
      let val = parseFloat(heightMetricInput.value) || 100;
      val = Math.max(100, Math.min(250, val));
      heightSlider.value = val;
      calculateAndUpdate();
    });
    heightFeetInput.addEventListener('input', () => {
      syncHeightToSliderFromImperial();
      calculateAndUpdate();
    });
    heightInchesInput.addEventListener('input', () => {
      syncHeightToSliderFromImperial();
      calculateAndUpdate();
    });
    
    // Weight inputs / slider sync
    weightSlider.addEventListener('input', () => {
      syncWeightFromSlider();
      calculateAndUpdate();
    });
    weightMetricInput.addEventListener('input', () => {
      let val = parseFloat(weightMetricInput.value) || 20;
      val = Math.max(20, Math.min(250, val));
      weightSlider.value = val;
      calculateAndUpdate();
    });
    weightImperialInput.addEventListener('input', () => {
      let val = parseFloat(weightImperialInput.value) || 44;
      val = Math.max(44, Math.min(550, val));
      weightSlider.value = val;
      calculateAndUpdate();
    });
    
    // Action buttons
    saveBtn.addEventListener('click', saveRecord);
    clearHistoryBtn.addEventListener('click', clearHistory);
  }

  // --- Set Unit System ---
  function setUnit(unit) {
    if (currentUnit === unit) return;
    currentUnit = unit;
    
    if (unit === 'metric') {
      unitMetricBtn.classList.add('active');
      unitImperialBtn.classList.remove('active');
      
      // Toggle inputs visibility
      document.querySelectorAll('.metric-only').forEach(el => el.classList.remove('hidden'));
      document.querySelectorAll('.imperial-only').forEach(el => el.classList.add('hidden'));
      
      // Convert height Imperial -> Metric
      const ft = parseInt(heightFeetInput.value) || 5;
      const inch = parseInt(heightInchesInput.value) || 0;
      const totalInches = (ft * 12) + inch;
      const cm = Math.round(totalInches * 2.54);
      heightMetricInput.value = Math.max(100, Math.min(250, cm));
      
      // Update Height Slider bounds for metric
      heightSlider.min = 100;
      heightSlider.max = 250;
      heightSlider.value = heightMetricInput.value;
      if (heightTickMin) heightTickMin.textContent = '100 cm';
      if (heightTickMax) heightTickMax.textContent = '250 cm';
      
      // Convert weight Imperial -> Metric
      const lbs = parseFloat(weightImperialInput.value) || 154;
      const kg = Math.round((lbs * 0.45359237) * 10) / 10;
      weightMetricInput.value = Math.max(20, Math.min(250, kg));
      
      // Update Weight Slider bounds for metric
      weightSlider.min = 20;
      weightSlider.max = 250;
      weightSlider.step = 0.5;
      weightSlider.value = weightMetricInput.value;
      if (weightTickMin) weightTickMin.textContent = '20 kg';
      if (weightTickMax) weightTickMax.textContent = '250 kg';
      
    } else {
      unitMetricBtn.classList.remove('active');
      unitImperialBtn.classList.add('active');
      
      // Toggle inputs visibility
      document.querySelectorAll('.metric-only').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.imperial-only').forEach(el => el.classList.remove('hidden'));
      
      // Convert height Metric -> Imperial
      const cm = parseFloat(heightMetricInput.value) || 175;
      const totalInches = cm / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = Math.round(totalInches % 12);
      heightFeetInput.value = ft;
      heightInchesInput.value = inch;
      
      // Update Height Slider bounds for imperial
      heightSlider.min = 39; // ~100cm
      heightSlider.max = 98;  // ~250cm
      heightSlider.value = Math.round(totalInches);
      if (heightTickMin) heightTickMin.textContent = '3 ft 3 in';
      if (heightTickMax) heightTickMax.textContent = '8 ft 2 in';
      
      // Convert weight Metric -> Imperial
      const kg = parseFloat(weightMetricInput.value) || 70;
      const lbs = Math.round((kg / 0.45359237) * 10) / 10;
      weightImperialInput.value = Math.max(44, Math.min(550, lbs));
      
      // Update Weight Slider bounds for imperial
      weightSlider.min = 44;
      weightSlider.max = 550;
      weightSlider.step = 1;
      weightSlider.value = weightImperialInput.value;
      if (weightTickMin) weightTickMin.textContent = '44 lbs';
      if (weightTickMax) weightTickMax.textContent = '550 lbs';
    }
    
    calculateAndUpdate();
  }

  // --- Set Sex demographic ---
  function setSex(sex) {
    if (currentSex === sex) return;
    currentSex = sex;
    if (sex === 'male') {
      sexMaleBtn.classList.add('active');
      sexFemaleBtn.classList.remove('active');
    } else {
      sexMaleBtn.classList.remove('active');
      sexFemaleBtn.classList.add('active');
    }
    calculateAndUpdate();
  }

  // --- Sync height input values from slider position ---
  function syncHeightFromSlider() {
    const val = parseInt(heightSlider.value);
    if (currentUnit === 'metric') {
      heightMetricInput.value = val;
    } else {
      heightFeetInput.value = Math.floor(val / 12);
      heightInchesInput.value = val % 12;
    }
  }

  // --- Sync height slider position from imperial inputs ---
  function syncHeightToSliderFromImperial() {
    const ft = parseInt(heightFeetInput.value) || 3;
    const inch = parseInt(heightInchesInput.value) || 0;
    const totalInches = (ft * 12) + inch;
    heightSlider.value = Math.max(39, Math.min(98, totalInches));
  }

  // --- Sync weight input values from slider position ---
  function syncWeightFromSlider() {
    const val = parseFloat(weightSlider.value);
    if (currentUnit === 'metric') {
      weightMetricInput.value = val;
    } else {
      weightImperialInput.value = val;
    }
  }

  // --- Calculations and UI Refresh ---
  function calculateAndUpdate() {
    let weightKg = 0;
    let heightCm = 0;
    let weightLbs = 0;
    let heightInches = 0;
    
    if (currentUnit === 'metric') {
      heightCm = parseFloat(heightMetricInput.value) || 175;
      weightKg = parseFloat(weightMetricInput.value) || 70;
      
      heightInches = heightCm / 2.54;
      weightLbs = weightKg / 0.45359237;
    } else {
      const ft = parseInt(heightFeetInput.value) || 5;
      const inch = parseInt(heightInchesInput.value) || 0;
      heightInches = (ft * 12) + inch;
      weightLbs = parseFloat(weightImperialInput.value) || 154;
      
      heightCm = heightInches * 2.54;
      weightKg = weightLbs * 0.45359237;
    }
    
    // Calculate BMI
    let bmi = 0;
    if (heightCm > 0) {
      const heightM = heightCm / 100;
      bmi = weightKg / (heightM * heightM);
    }
    
    calculatedBMI = parseFloat(bmi.toFixed(1));
    bmiValEl.textContent = calculatedBMI;
    
    // Determine status details
    let category = 'normal';
    let statusLabel = 'Normal Weight';
    
    if (calculatedBMI < 18.5) {
      category = 'underweight';
      statusLabel = 'Underweight';
    } else if (calculatedBMI < 25.0) {
      category = 'normal';
      statusLabel = 'Normal Weight';
    } else if (calculatedBMI < 30.0) {
      category = 'overweight';
      statusLabel = 'Overweight';
    } else {
      category = 'obese';
      statusLabel = 'Obese';
    }
    
    bmiStatusEl.textContent = statusLabel;
    
    // Update theme classes on body
    document.body.className = 'theme-' + category;
    
    // Calculate Healthy weight bounds (BMI 18.5 to 24.9)
    const minHealthyKg = 18.5 * Math.pow(heightCm / 100, 2);
    const maxHealthyKg = 24.9 * Math.pow(heightCm / 100, 2);
    
    if (currentUnit === 'metric') {
      idealRangeEl.textContent = `${minHealthyKg.toFixed(1)} kg - ${maxHealthyKg.toFixed(1)} kg`;
    } else {
      const minHealthyLbs = minHealthyKg / 0.45359237;
      const maxHealthyLbs = maxHealthyKg / 0.45359237;
      idealRangeEl.textContent = `${minHealthyLbs.toFixed(1)} lbs - ${maxHealthyLbs.toFixed(1)} lbs`;
    }
    
    // Update SVG semi-circular Gauge DashOffset
    // The gauge is a semi-circle path, stroke-dasharray="251.3".
    // We map BMI range [15, 35] to gauge fill percentage [0%, 100%]
    const minBmiRange = 15;
    const maxBmiRange = 35;
    let bmiPercent = (calculatedBMI - minBmiRange) / (maxBmiRange - minBmiRange);
    bmiPercent = Math.max(0, Math.min(1, bmiPercent)); // clamp
    
    // 251.3 offset = 0% filled (completely empty)
    // 0 offset = 100% filled (completely full)
    const newOffset = 251.3 - (bmiPercent * 251.3);
    gaugeFill.style.strokeDashoffset = newOffset;
    
    // Update Guidance card details
    const tips = recommendations[category];
    insightTitleEl.textContent = tips.title;
    insightDescEl.textContent = tips.desc;
    tipNutritionEl.textContent = tips.nutrition;
    tipExerciseEl.textContent = tips.exercise;
  }

  // --- LocalStorage Log Database Operations ---
  function getRecords() {
    return JSON.parse(localStorage.getItem('aerobmi_history')) || [];
  }

  function saveRecord() {
    const records = getRecords();
    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    
    let heightStr = '';
    let weightStr = '';
    
    if (currentUnit === 'metric') {
      heightStr = `${heightMetricInput.value} cm`;
      weightStr = `${weightMetricInput.value} kg`;
    } else {
      heightStr = `${heightFeetInput.value}'${heightInchesInput.value}"`;
      weightStr = `${weightImperialInput.value} lbs`;
    }
    
    const category = document.body.className.replace('theme-', '');
    const statusLabel = bmiStatusEl.textContent;
    const age = ageInput.value;
    const sex = currentSex.charAt(0).toUpperCase() + currentSex.slice(1);
    
    const newRecord = {
      id: Date.now(),
      date: today,
      demographics: `${age}y / ${sex}`,
      height: heightStr,
      weight: weightStr,
      bmi: calculatedBMI.toFixed(1),
      status: statusLabel,
      statusClass: category
    };
    
    records.unshift(newRecord); // add to top of history
    localStorage.setItem('aerobmi_history', JSON.stringify(records));
    
    loadHistory();
    showToast("Record saved successfully!");
  }

  function deleteRecord(id) {
    let records = getRecords();
    records = records.filter(r => r.id !== id);
    localStorage.setItem('aerobmi_history', JSON.stringify(records));
    loadHistory();
    showToast("Record deleted.");
  }

  function clearHistory() {
    if (confirm("Are you sure you want to clear all weight logs? This action cannot be undone.")) {
      localStorage.removeItem('aerobmi_history');
      loadHistory();
      showToast("History cleared.");
    }
  }

  function loadHistory() {
    const records = getRecords();
    
    // Reset table content
    historyTbody.innerHTML = '';
    
    // Update badge count
    historyCountBadge.textContent = `${records.length} ${records.length === 1 ? 'Record' : 'Records'}`;
    
    if (records.length === 0) {
      emptyHistoryState.style.display = 'table-row';
      historyTbody.appendChild(emptyHistoryState);
      return;
    }
    
    emptyHistoryState.style.display = 'none';
    
    records.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.date}</td>
        <td>${r.demographics}</td>
        <td>${r.height}</td>
        <td>${r.weight}</td>
        <td><strong>${r.bmi}</strong></td>
        <td><span class="status-badge ${r.statusClass}">${r.status}</span></td>
        <td>
          <button class="delete-record-btn" data-id="${r.id}" title="Delete Record">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </td>
      `;
      historyTbody.appendChild(tr);
    });

    // Add click listeners to delete buttons
    document.querySelectorAll('.delete-record-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(btn.getAttribute('data-id'));
        deleteRecord(id);
      });
    });
  }

  // --- Dynamic feedback toast ---
  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.background = 'rgba(17, 24, 39, 0.9)';
    toast.style.border = '1px solid var(--glass-border)';
    toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
    toast.style.color = '#fff';
    toast.style.padding = '0.75rem 1.5rem';
    toast.style.borderRadius = '10px';
    toast.style.fontSize = '0.9rem';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.3s ease';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    
    document.body.appendChild(toast);
    
    // trigger reflow then show
    setTimeout(() => {
      toast.textContent = message;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);
    
    // disappear in 3s
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Run initial calculations
  init();
});
