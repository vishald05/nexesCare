/* filepath: c:\Users\vimal\OneDrive\Apps\Desktop\front_end_of_ux_project\script.js */
// ================== NEXESCARE 3D VEHICLE DIAGNOSTIC SYSTEM ==================

// === GLOBAL VARIABLES ===
let isAnimating = true;
let currentViewMode = 'normal';
let selectedAgent = null;
let feedActive = true;
let vehicleRotation = { x: 0, y: 0, z: 0 };

// === REAL VEHICLE DATA ===
let vehicleData = {
  mileage: 0,
  batteryHealth: 0,
  batteryVoltage: 0,
  engineStatus: "Loading...",
  lastService: "Loading...",
  brakePads: 0,
  coolantLevel: 0,
  oilLife: 0,
  tireCondition: "Loading...",
  airFilterHealth: 0,
  brakeFluidStatus: "Loading...",
  transmissionFluidLevel: "Loading...",
  fuelEfficiency: 0,
  drivingScore: 0,
  nextServiceKm: 0,
  maintenanceHistory: [],
  upcomingTasks: [],
  criticalAlerts: [],
  ecoTips: [],
  vehicleId: "Loading..."
};

// Add current user data
let currentUser = null;

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
  initializeParticles();
  simulateLoading();
  checkAuthAndLoadDashboard();
  setupEventListeners();
  initializeComponentTooltips();
});

// === AUTHENTICATION AND DATA LOADING ===
async function checkAuthAndLoadDashboard() {
  console.log('🔍 Checking authentication...', { 
    currentPath: window.location.pathname,
    href: window.location.href 
  });
  
  // Check for token in multiple storage locations
  let token = localStorage.getItem('token');
  
  // If not found, check in nexescare_auth format
  if (!token) {
    const authData = localStorage.getItem('nexescare_auth') || 
                     sessionStorage.getItem('nexescare_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        token = parsed.token;
        // Store in simple format for compatibility
        if (token) {
          localStorage.setItem('token', token);
          console.log('✅ Token found in auth data and stored for compatibility');
        }
      } catch (err) {
        console.error('❌ Invalid auth data:', err);
      }
    }
  } else {
    console.log('✅ Token found in localStorage');
  }
  
  if (!token) {
    console.log('❌ No token found, checking if we need to redirect...');
    // Only redirect if we're actually on the dashboard page
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname === '/dashboard.html' || 
        window.location.pathname === '/dashboard') {
      console.log('🔄 Redirecting to login...');
      window.location.href = 'login.html';
    }
    return;
  }
  
  console.log('🔄 Loading dashboard data...');
  try {
    await loadDashboardData();
    initializeAgents();
    startLiveDataUpdates();
    console.log('✅ Dashboard loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load dashboard:', error);
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('🔄 Token invalid, clearing auth and redirecting...');
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('nexescare_auth');
      sessionStorage.removeItem('nexescare_auth');
      window.location.href = 'login.html';
    }
  }
}

function logout() {
  // Clear all authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('nexescare_auth');
  sessionStorage.removeItem('nexescare_auth');
  
  // Redirect to login page
  window.location.href = 'login.html';
}

async function loadDashboardData() {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch('http://localhost:3000/api/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Update global vehicle data
    vehicleData = { ...vehicleData, ...data.vehicleData };
    currentUser = data.user;
    
    // Update the UI with real data
    updateDashboardUI();
    
    console.log('✅ Real vehicle data loaded:', vehicleData.vehicleId);
    
  } catch (error) {
    console.error('❌ Error loading dashboard data:', error);
    throw error;
  }
}

function updateDashboardUI() {
  console.log('🎨 Updating dashboard UI with vehicle data:', vehicleData.vehicleId);
  
  // Update vehicle info in header
  const vehicleInfo = document.getElementById('vehicle-info');
  if (vehicleInfo && currentUser) {
    vehicleInfo.textContent = `${currentUser.firstName}'s Vehicle: ${vehicleData.vehicleId}`;
  }
  
  // Update main data cards
  document.getElementById('mileage').textContent = vehicleData.mileage.toLocaleString() + ' km';
  document.getElementById('battery').textContent = vehicleData.batteryHealth + '%';
  document.getElementById('engine').textContent = vehicleData.engineStatus;
  
  // Calculate days since last service
  const lastServiceDate = new Date(vehicleData.lastService);
  const today = new Date();
  const daysSince = Math.floor((today - lastServiceDate) / (1000 * 60 * 60 * 24));
  document.getElementById('last-service').textContent = daysSince + ' days ago';
  
  // Update battery status styling
  const batteryElement = document.getElementById('battery');
  if (vehicleData.batteryHealth < 50) {
    batteryElement.className = 'data-value critical';
  } else if (vehicleData.batteryHealth < 80) {
    batteryElement.className = 'data-value warning';
  } else {
    batteryElement.className = 'data-value good';
  }
  
  // Update engine status styling
  const engineElement = document.getElementById('engine');
  if (vehicleData.engineStatus === 'Critical') {
    engineElement.className = 'data-value critical';
  } else if (vehicleData.engineStatus === 'Check Required') {
    engineElement.className = 'data-value warning';
  } else {
    engineElement.className = 'data-value good';
  }
  
  // Update user info display
  if (currentUser) {
    console.log('👤 Current user:', currentUser.firstName, '- Vehicle:', vehicleData.vehicleId);
  }
}

// === PARTICLE BACKGROUND ===
function initializeParticles() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#00d4ff" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: false },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#00d4ff",
          opacity: 0.4,
          width: 1
        },
        move: {
          enable: true,
          speed: 6,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 400, line_linked: { opacity: 1 } },
          bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 },
          repulse: { distance: 200, duration: 0.4 },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 }
        }
      },
      retina_detect: true
    });
  }
}

// === LOADING SIMULATION ===
function simulateLoading() {
  const loadingScreen = document.getElementById('loading-screen');
  const progressBar = document.getElementById('progress-bar');
  const loadingText = document.getElementById('loading-text');
  
  const loadingSteps = [
    { progress: 25, text: "Loading Vehicle Data..." },
    { progress: 50, text: "Initializing AI Agents..." },
    { progress: 75, text: "Connecting to Vehicle Systems..." },
    { progress: 100, text: "NexesCare Ready!" }
  ];
  
  let currentStep = 0;
  
  const loadingInterval = setInterval(() => {
    if (currentStep < loadingSteps.length) {
      const step = loadingSteps[currentStep];
      progressBar.style.width = step.progress + '%';
      loadingText.textContent = step.text;
      currentStep++;
    } else {
      clearInterval(loadingInterval);
      setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 500);
      }, 1000);
    }
  }, 800);
}

// === AGENT MANAGEMENT ===
function initializeAgents() {
  // Analyze real vehicle data for each agent
  updateDiagnosticAgent();
  updateMaintenanceAgent();
  updateEmergencyAgent();
  updatePredictiveAgent();
  
  // Update agents status count
  updateAgentsStatusCount();
}

function updateAgentsStatusCount() {
  const agentIds = ['diagnostic', 'maintenance', 'emergency', 'predictive'];
  const activeStates = ['active', 'alert', 'warning']; // Define what counts as active

  let activeCount = 0;

  agentIds.forEach(agentId => {
    const agentElement = document.getElementById(`${agentId}-agent`);
    if (!agentElement) {
      console.warn(`Agent DOM not found: #${agentId}-agent`);
      return;
    }

    const statusElement = agentElement.querySelector('.agent-status');
    if (!statusElement) {
      console.warn(`Status element missing in #${agentId}-agent`);
      return;
    }

    const statusText = statusElement.textContent?.trim().toLowerCase();
    if (activeStates.includes(statusText)) {
      activeCount++;
    }
  });

  const statusTextEl = document.getElementById('agents-status-text');
  if (statusTextEl) {
    statusTextEl.textContent = `${activeCount} of ${agentIds.length} Agents Active`;
  } else {
    console.warn("Status text element '#agents-status-text' not found.");
  }
}


function updateDiagnosticAgent() {
  const issues = [];

  // 🔍 Analyze vehicle data for potential issues
  if (vehicleData.batteryHealth < 80) issues.push('Battery health below 80%');
  if (vehicleData.brakePads < 30) issues.push('Brake pads worn (<30%)');
  if (['Check Required', 'Critical'].includes(vehicleData.engineStatus)) issues.push(`Engine status: ${vehicleData.engineStatus}`);
  if (vehicleData.oilLife < 20) issues.push('Low oil life (<20%)');
  if (vehicleData.airFilterHealth < 50) issues.push('Air filter needs attention (<50%)');
  if (vehicleData.brakeFluidStatus === 'Needs Replacement') issues.push('Brake fluid needs replacement');
  if (vehicleData.coolantLevel < 50) issues.push('Coolant level is low (<50%)');

  const issueCount = issues.length;

  let status = issueCount > 0 ? 'alert' : 'active';
  let message = '';

  if (issueCount === 0) {
    message = `Vehicle ${vehicleData.vehicleId}: All systems optimal`;
  } else {
    message = `Vehicle ${vehicleData.vehicleId}: ${issueCount} issue${issueCount > 1 ? 's' : ''} detected.\n- ${issues.join('\n- ')}`;
  }

  updateAgentStatus('diagnostic', status, message);
}


function updateMaintenanceAgent() {
  let status = 'standby';
  const messages = [];
  const needs = [];

  // 🔧 Service due soon?
  if (vehicleData.nextServiceKm < 1000) {
    status = 'warning';
    messages.push(`Next service due in ${vehicleData.nextServiceKm} km.`);
  } else {
    messages.push(`Next service in ${vehicleData.nextServiceKm} km.`);
  }

  // 🔍 Check for known maintenance needs
  if (vehicleData.brakePads < 40) {
    needs.push('Brake pads need attention');
  }
  if (vehicleData.oilLife < 30) {
    needs.push('Oil change needed');
  }
  if (vehicleData.airFilterHealth < 60) {
    needs.push('Air filter replacement recommended');
  }
  if (vehicleData.brakeFluidStatus === 'Needs Replacement') {
    needs.push('Brake fluid replacement needed');
  }

  if (needs.length > 0) {
    status = 'active';
    messages.push(...needs.map(n => `- ${n}`));
  }

  // 📝 Show upcoming tasks (from dataset)
  if (vehicleData.upcomingTasks?.length > 0) {
    messages.push(...vehicleData.upcomingTasks.map(task => `Upcoming: ${task}`));
  }

  const finalMessage = `Vehicle ${vehicleData.vehicleId}:\n` + messages.join('\n');
  updateAgentStatus('maintenance', status, finalMessage);
}


function updateEmergencyAgent() {
  let status = 'standby';
  let message = `Vehicle ${vehicleData.vehicleId}: No emergency alerts`;
  
  // Check for critical issues
  if (vehicleData.criticalAlerts && vehicleData.criticalAlerts.length > 0) {
    status = 'alert';
    message = `CRITICAL: ${vehicleData.criticalAlerts[0]}`;
  } else if (vehicleData.batteryVoltage < 11.8) {
    status = 'alert';
    message = `CRITICAL: Battery voltage low (${vehicleData.batteryVoltage}V)`;
  } else if (vehicleData.batteryHealth < 30) {
    status = 'alert';
    message = `CRITICAL: Battery health critical (${vehicleData.batteryHealth}%)`;
  } else if (vehicleData.brakePads < 15) {
    status = 'alert';
    message = `CRITICAL: Brake pads worn (${vehicleData.brakePads}%)`;
  } else if (vehicleData.brakeFluidStatus === 'Needs Replacement') {
    status = 'warning';
    message = `WARNING: Brake fluid needs replacement`;
  } else if (vehicleData.batteryHealth < 50) {
    status = 'warning';
    message = `WARNING: Battery health low (${vehicleData.batteryHealth}%)`;
  }
  
  updateAgentStatus('emergency', status, message);
}

function updatePredictiveAgent() {
  let status = 'learning';
  let message = `Vehicle ${vehicleData.vehicleId}: Analyzing patterns...`;
  
  // Generate predictions based on current data
  if (vehicleData.fuelEfficiency && vehicleData.drivingScore) {
    const optimalEfficiency = 20; // Assume 20 L/100km as baseline
    const improvementPotential = Math.max(0, vehicleData.fuelEfficiency - optimalEfficiency);
    
    if (improvementPotential > 3) {
      message = `Fuel efficiency can improve by ${improvementPotential.toFixed(1)} L/100km. `;
    } else {
      message = `Fuel efficiency optimized. `;
    }
    
    if (vehicleData.drivingScore < 7) {
      message += `Driving score: ${vehicleData.drivingScore}/10 - Improvement recommended.`;
    } else {
      message += `Driving score: ${vehicleData.drivingScore}/10 - Excellent!`;
    }
  }
  
  updateAgentStatus('predictive', status, message);
}

function updateAgentStatus(agentId, status, message) {
  const agent = document.getElementById(agentId + '-agent');
  if (!agent) return;
  
  const statusElement = agent.querySelector('.agent-status');
  const suggestionElement = agent.querySelector('.agent-suggestion');
  
  // Update text content
  statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  statusElement.className = 'agent-status ' + status;
  suggestionElement.textContent = message;
  
  // Update visual indicators
  const avatar = agent.querySelector('.agent-avatar');
  const pulseRing = agent.querySelector('.pulse-ring');
  
  // Reset all status classes
  avatar.classList.remove('warning', 'alert', 'critical');
  pulseRing.classList.remove('warning', 'alert', 'critical');
  
  // Apply new status classes
  if (status === 'alert' || status === 'critical') {
    avatar.classList.add('warning');
    pulseRing.classList.add('warning');
  } else if (status === 'warning') {
    avatar.classList.add('warning');
    pulseRing.classList.add('warning');
  }
  
  // Update progress bar for emergency agent
  if (agentId === 'emergency') {
    const progressFill = agent.querySelector('.progress-fill');
    const progressText = agent.querySelector('.progress-text');
    
    if (status === 'alert' || status === 'critical') {
      progressFill.className = 'progress-fill warning';
      progressFill.style.width = '90%';
      progressText.textContent = 'Critical Level';
    } else if (status === 'warning') {
      progressFill.className = 'progress-fill warning';
      progressFill.style.width = '60%';
      progressText.textContent = 'Warning Level';
    } else {
      progressFill.className = 'progress-fill';
      progressFill.style.width = '30%';
      progressText.textContent = 'Normal';
    }
  }
  
  console.log(`🤖 ${agentId} agent updated:`, { status, message });
  
  // Update agents count after any status change
  updateAgentsStatusCount();
}

function selectAgent(agentType) {
  // Remove active class from all agents
  document.querySelectorAll('.agent-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Add active class to selected agent
  const selectedCard = document.getElementById(agentType + '-agent');
  selectedCard.classList.add('active');
  
  selectedAgent = agentType;
  
  // Update vehicle visualization based on selected agent
  updateVehicleVisualization(agentType);
  
  // Add to feed
  addToAnalysisFeed(`${agentType.charAt(0).toUpperCase() + agentType.slice(1)} AI selected for detailed analysis`);
}

// === VEHICLE VISUALIZATION ===
function updateVehicleVisualization(agentType) {
  const vehicleModel = document.getElementById('vehicle-model');
  
  // Reset all highlights
  vehicleModel.querySelectorAll('[data-component]').forEach(component => {
    component.style.borderColor = '';
    component.style.boxShadow = '';
  });
  
  // Apply agent-specific highlights
  switch (agentType) {
    case 'diagnostic':
      highlightComponent('battery', '#ff6b35');
      highlightComponent('brakes', '#ff4444');
      break;
    case 'maintenance':
      highlightComponent('brakes', '#ff6b35');
      highlightComponent('engine', '#4ecdc4');
      break;
    case 'emergency':
      highlightComponent('battery', '#ff4444');
      break;
    case 'predictive':
      highlightComponent('engine', '#00d4ff');
      highlightComponent('fuel-system', '#4ecdc4');
      break;
  }
}

function highlightComponent(componentName, color) {
  const components = document.querySelectorAll(`[data-component="${componentName}"]`);
  components.forEach(component => {
    component.style.borderColor = color;
    component.style.boxShadow = `0 0 15px ${color}`;
  });
}

function toggleAnimation() {
  isAnimating = !isAnimating;
  const vehicleModel = document.getElementById('vehicle-model');
  const animBtn = document.getElementById('anim-btn');
  
  if (isAnimating) {
    vehicleModel.style.animationPlayState = 'running';
    animBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    vehicleModel.style.animationPlayState = 'paused';
    animBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

function resetView() {
  vehicleRotation = { x: 0, y: 0, z: 0 };
  const vehicleModel = document.getElementById('vehicle-model');
  vehicleModel.style.transform = 'rotateX(0deg) rotateY(0deg)';
  vehicleModel.style.animationPlayState = 'running';
  isAnimating = true;
  
  const animBtn = document.getElementById('anim-btn');
  animBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function toggleXRay() {
  const vehicleModel = document.getElementById('vehicle-model');
  vehicleModel.classList.toggle('xray-mode');
  
  const xrayBtn = document.getElementById('xray-btn');
  if (vehicleModel.classList.contains('xray-mode')) {
    xrayBtn.style.background = 'linear-gradient(45deg, #00d4ff, #ff6b35)';
  } else {
    xrayBtn.style.background = '';
  }
}

function explodeView() {
  const vehicleModel = document.getElementById('vehicle-model');
  vehicleModel.classList.toggle('exploded');
  
  const explodeBtn = document.getElementById('explode-btn');
  if (vehicleModel.classList.contains('exploded')) {
    explodeBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
  } else {
    explodeBtn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';
  }
}

function startAIScan() {
  const scanLines = document.getElementById('scan-lines');
  scanLines.style.display = 'block';
  
  // Simulate AI analysis
  setTimeout(() => {
    addToAnalysisFeed('AI Scan completed - 3 components analyzed');
    scanLines.style.display = 'none';
  }, 3000);
  
  addToAnalysisFeed('AI Scan initiated - Analyzing vehicle components');
}

// === COMPONENT TOOLTIPS ===
function initializeComponentTooltips() {
  const tooltip = document.getElementById('component-tooltip');
  const components = document.querySelectorAll('[data-component]');
  
  components.forEach(component => {
    component.addEventListener('mouseenter', (e) => {
      showComponentTooltip(e, component.dataset.component, component.dataset.status);
    });
    
    component.addEventListener('mouseleave', () => {
      hideComponentTooltip();
    });
  });
}

function showComponentTooltip(event, componentName, status) {
  const tooltip = document.getElementById('component-tooltip');
  const titleElement = document.getElementById('tooltip-title');
  const statusElement = document.getElementById('tooltip-status');
  const descriptionElement = document.getElementById('tooltip-description');
  
  // Component data
  const componentData = {
    'engine': { name: 'Engine', description: 'Primary propulsion system' },
    'battery': { name: 'Battery', description: 'Electrical power storage' },
    'brakes': { name: 'Brake System', description: 'Vehicle stopping mechanism' },
    'transmission': { name: 'Transmission', description: 'Power transmission system' },
    'fuel-system': { name: 'Fuel System', description: 'Fuel delivery and management' },
    'air-filter': { name: 'Air Filter', description: 'Engine air filtration' }
  };
  
  const data = componentData[componentName] || { name: componentName, description: 'Vehicle component' };
  
  titleElement.textContent = data.name;
  statusElement.textContent = `Status: ${status || 'Good'}`;
  descriptionElement.textContent = data.description;
  
  // Position tooltip
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY + 10 + 'px';
  tooltip.classList.add('show');
}

function hideComponentTooltip() {
  const tooltip = document.getElementById('component-tooltip');
  tooltip.classList.remove('show');
}

// === AGENT ACTIONS ===
function runDiagnostic(event) {
  event.stopPropagation();
  addToAnalysisFeed('Diagnostic AI: Full system scan initiated');
  
  // Simulate diagnostic progress
  const progressFill = document.querySelector('#diagnostic-agent .progress-fill');
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += 5;
    progressFill.style.width = progress + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      addToAnalysisFeed('Diagnostic AI: Full scan completed - Report generated');
    }
  }, 200);
}

function scheduleService(event) {
  event.stopPropagation();
  addToAnalysisFeed('Maintenance AI: Service appointment scheduled for next week');
  updateAgentStatus('maintenance', 'active', 'Service scheduled for brake pad replacement');
}

function emergencyMode(event) {
  event.stopPropagation();
  addToAnalysisFeed('Emergency AI: Emergency mode activated - Contacting nearest service center');
  updateAgentStatus('emergency', 'active', 'Emergency response initiated');
}

function runPrediction(event) {
  event.stopPropagation();
  addToAnalysisFeed('Predictive AI: Running advanced pattern analysis');
  updateAgentStatus('predictive', 'active', 'Predicting optimal maintenance schedule');
}

function viewReport(event) {
  event.stopPropagation();
  addToAnalysisFeed('Opening detailed diagnostic report');
}

function viewMaintenance(event) {
  event.stopPropagation();
  addToAnalysisFeed('Opening maintenance history');
}

function contactService(event) {
  event.stopPropagation();
  addToAnalysisFeed('Contacting emergency service center');
}

function viewInsights(event) {
  event.stopPropagation();
  addToAnalysisFeed('Opening predictive insights dashboard');
}

// === ANALYSIS FEED ===
function addToAnalysisFeed(message) {
  if (!feedActive) return;
  
  const feedContent = document.getElementById('analysis-feed');
  const timestamp = new Date().toLocaleTimeString();
  
  const feedItem = document.createElement('div');
  feedItem.className = 'feed-item';
  feedItem.innerHTML = `
    <span class="timestamp">${timestamp}</span>
    <span class="message">${message}</span>
  `;
  
  feedContent.insertBefore(feedItem, feedContent.firstChild);
  
  // Limit feed items
  if (feedContent.children.length > 10) {
    feedContent.removeChild(feedContent.lastChild);
  }
}

function toggleFeed() {
  feedActive = !feedActive;
  const feedIcon = document.getElementById('feed-icon');
  
  if (feedActive) {
    feedIcon.className = 'fas fa-pause';
    addToAnalysisFeed('Live feed resumed');
  } else {
    feedIcon.className = 'fas fa-play';
  }
}

// === LIVE DATA UPDATES ===
function startLiveDataUpdates() {
  // Refresh vehicle data every 30 seconds
  setInterval(async () => {
    try {
      await loadDashboardData();
      initializeAgents(); // Re-analyze with updated data
      updateAgentProgress();
    } catch (error) {
      console.error('Failed to update data:', error);
    }
  }, 30000);
  
  // Update agent progress more frequently
  setInterval(() => {
    updateAgentProgress();
  }, 5000);
}

function updateVehicleData() {
  // This function is now handled by loadDashboardData()
  // But we can still simulate minor fluctuations for demo purposes
  if (vehicleData.batteryVoltage) {
    // Simulate minor voltage fluctuations
    const baseVoltage = vehicleData.batteryVoltage;
    const fluctuation = (Math.random() - 0.5) * 0.1;
    const currentVoltage = Math.max(10.5, Math.min(14.0, baseVoltage + fluctuation));
    
    // Update battery display if significant change
    if (Math.abs(currentVoltage - baseVoltage) > 0.05) {
      addToAnalysisFeed(`Battery voltage: ${currentVoltage.toFixed(2)}V`);
    }
  }
}

function updateAgentProgress() {
  // Simulate agent progress updates
  const agents = ['diagnostic', 'maintenance', 'predictive'];
  
  agents.forEach(agent => {
    const progressFill = document.querySelector(`#${agent}-agent .progress-fill`);
    if (progressFill) {
      const currentWidth = parseInt(progressFill.style.width) || 0;
      const newWidth = Math.min(100, currentWidth + Math.floor(Math.random() * 10));
      progressFill.style.width = newWidth + '%';
    }
  });
}

// === EVENT LISTENERS ===
function setupEventListeners() {
  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
      case ' ':
        event.preventDefault();
        toggleAnimation();
        break;
      case 'r':
        resetView();
        break;
      case 'x':
        toggleXRay();
        break;
      case 'e':
        explodeView();
        break;
      case 'arrowleft':
        rotateVehicle('left');
        break;
      case 'arrowright':
        rotateVehicle('right');
        break;
      case 'arrowup':
        rotateVehicle('up');
        break;
      case 'arrowdown':
        rotateVehicle('down');
        break;
    }
  });
  
  // Window resize
  window.addEventListener('resize', () => {
    // Reinitialize particles if needed
    if (typeof particlesJS !== 'undefined') {
      initializeParticles();
    }
  });
}

// === UTILITY FUNCTIONS ===
function getRandomColor() {
  const colors = ['#00d4ff', '#ff6b35', '#4ecdc4', '#ff4444', '#45b7d1'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function formatTimestamp() {
  return new Date().toLocaleTimeString();
}

// === MODAL FUNCTIONALITY ===
function showModal(title, message, agentType, recommendations = [], urgency = 'normal') {
  const modal = document.getElementById('modal-overlay');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalAvatar = document.getElementById('modal-avatar');
  const recommendationCard = document.getElementById('recommendation-card');
  const recommendationsList = document.getElementById('recommendations-list');
  const urgencyLevel = document.getElementById('urgency-level');
  const primaryBtn = document.getElementById('modal-primary-btn');

  // Set modal content
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  
  // Set avatar icon based on agent type
  const avatarIcons = {
    diagnostic: 'fas fa-robot',
    maintenance: 'fas fa-tools',
    emergency: 'fas fa-exclamation-triangle',
    predictive: 'fas fa-brain'
  };
  modalAvatar.innerHTML = `<i class="${avatarIcons[agentType] || 'fas fa-robot'}"></i>`;

  // Show recommendations if any
  if (recommendations.length > 0) {
    recommendationCard.classList.remove('hidden');
    recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
  } else {
    recommendationCard.classList.add('hidden');
  }

  // Set urgency level
  urgencyLevel.textContent = urgency;
  urgencyLevel.className = `urgency-level ${urgency}`;

  // Update primary button based on urgency
  if (urgency === 'critical') {
    primaryBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Take Action';
    primaryBtn.className = 'action-btn danger';
  } else if (urgency === 'warning') {
    primaryBtn.innerHTML = '<i class="fas fa-wrench"></i> Schedule Service';
    primaryBtn.className = 'action-btn warning';
  } else {
    primaryBtn.innerHTML = '<i class="fas fa-check"></i> Acknowledge';
    primaryBtn.className = 'action-btn primary';
  }

  // Show modal
  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('modal-overlay');
  modal.classList.remove('active');
}

function handlePrimaryAction() {
  // Simulate taking action based on the current modal context
  addToAnalysisFeed("System: Action acknowledged and processed");
  closeModal();
}

// === ENHANCED AGENT INTERACTIONS ===
function runDiagnostic(event) {
  event.stopPropagation();
  
  // Simulate diagnostic process
  const diagnosticAgent = document.getElementById('diagnostic-agent');
  const suggestion = diagnosticAgent.querySelector('.agent-suggestion');
  
  // Update agent status
  suggestion.textContent = "Running comprehensive diagnostic...";
  
  setTimeout(() => {
    // Generate real diagnostic results based on current vehicle data
    const diagnosticResults = [];
    const recommendations = [];
    
    // Battery analysis
    if (vehicleData.batteryHealth < 80) {
      diagnosticResults.push(`Battery health: ${vehicleData.batteryHealth}% (${vehicleData.batteryHealth < 50 ? 'Critical' : 'Low'} - Replace recommended)`);
      recommendations.push(`Replace battery within ${vehicleData.batteryHealth < 50 ? '1 week' : '1 month'}`);
    } else {
      diagnosticResults.push(`Battery health: ${vehicleData.batteryHealth}% (Good condition)`);
    }
    
    // Brake analysis
    if (vehicleData.brakePads < 30) {
      diagnosticResults.push(`Brake pads: ${vehicleData.brakePads}% remaining (${vehicleData.brakePads < 15 ? 'Critical' : 'Service needed'})`);
      recommendations.push(`Schedule brake service ${vehicleData.brakePads < 15 ? 'immediately' : 'within 2 weeks'}`);
    } else {
      diagnosticResults.push(`Brake pads: ${vehicleData.brakePads}% remaining (Good condition)`);
    }
    
    // Engine analysis
    diagnosticResults.push(`Engine status: ${vehicleData.engineStatus}`);
    if (vehicleData.engineStatus === 'Check Required') {
      recommendations.push("Schedule engine diagnostic within 1 week");
    }
    
    // Oil analysis
    diagnosticResults.push(`Oil life: ${vehicleData.oilLife}% remaining`);
    if (vehicleData.oilLife < 20) {
      recommendations.push("Oil change required within 500 km");
    }
    
    // Air filter analysis
    diagnosticResults.push(`Air filter: ${vehicleData.airFilterHealth}% efficiency`);
    if (vehicleData.airFilterHealth < 50) {
      recommendations.push("Replace air filter");
    }
    
    // Determine urgency level
    let urgency = 'normal';
    if (vehicleData.batteryHealth < 50 || vehicleData.brakePads < 15 || vehicleData.criticalAlerts.length > 0) {
      urgency = 'critical';
    } else if (vehicleData.batteryHealth < 80 || vehicleData.brakePads < 30 || vehicleData.engineStatus === 'Check Required') {
      urgency = 'warning';
    }
    
    const issueCount = recommendations.length;
    const message = issueCount > 0 ? 
      `Diagnostic completed. ${issueCount} issue${issueCount > 1 ? 's' : ''} require${issueCount === 1 ? 's' : ''} attention.` :
      "Diagnostic completed. All systems are functioning normally.";
    
    showModal(
      "Diagnostic AI Report", 
      message, 
      "diagnostic",
      recommendations.length > 0 ? recommendations : ["All systems operating within normal parameters"],
      urgency
    );
    
    suggestion.textContent = `Diagnostic complete - ${issueCount} issue${issueCount > 1 ? 's' : ''} detected.`;
    addToAnalysisFeed(`Diagnostic AI: Full system scan completed - Vehicle ${vehicleData.vehicleId}`);
  }, 2000);
}

function scheduleService(event) {
  event.stopPropagation();
  
  // Generate maintenance recommendations based on real data
  const recommendations = [];
  
  if (vehicleData.nextServiceKm < 1000) {
    recommendations.push(`Regular service due in ${vehicleData.nextServiceKm} km`);
  }
  
  if (vehicleData.oilLife < 30) {
    recommendations.push(`Oil change required (${vehicleData.oilLife}% life remaining)`);
  }
  
  if (vehicleData.brakePads < 40) {
    recommendations.push(`Brake inspection recommended (${vehicleData.brakePads}% pads remaining)`);
  }
  
  if (vehicleData.batteryHealth < 80) {
    recommendations.push(`Battery replacement suggested (${vehicleData.batteryHealth}% health)`);
  }
  
  if (vehicleData.airFilterHealth < 60) {
    recommendations.push(`Air filter replacement (${vehicleData.airFilterHealth}% efficiency)`);
  }
  
  // Add upcoming tasks from vehicle data
  vehicleData.upcomingTasks.forEach(task => {
    recommendations.push(task);
  });
  
  if (recommendations.length === 0) {
    recommendations.push("No immediate maintenance required");
    recommendations.push("Continue regular maintenance schedule");
  }
  
  showModal(
    "Maintenance AI Scheduler",
    "Service appointment has been scheduled based on your vehicle's current condition.",
    "maintenance",
    recommendations,
    recommendations.length > 2 ? "warning" : "normal"
  );
  
  addToAnalysisFeed(`Maintenance AI: Service scheduled for vehicle ${vehicleData.vehicleId}`);
}

function emergencyMode(event) {
  event.stopPropagation();
  
  // Generate emergency recommendations based on real critical issues
  const recommendations = [];
  let urgency = 'warning';
  let message = "System monitoring active.";
  
  // Check for critical alerts from vehicle data
  if (vehicleData.criticalAlerts.length > 0) {
    urgency = 'critical';
    message = `CRITICAL: ${vehicleData.criticalAlerts[0]}`;
    recommendations.push("Pull over safely if driving");
    recommendations.push("Contact emergency roadside assistance");
    recommendations.push("Do not continue driving");
  } else if (vehicleData.batteryVoltage < 11.8) {
    urgency = 'critical';
    message = `CRITICAL: Battery voltage critically low (${vehicleData.batteryVoltage}V). Immediate action required!`;
    recommendations.push("Turn off non-essential electronics");
    recommendations.push("Avoid restarting the engine unnecessarily");
    recommendations.push("Contact roadside assistance");
  } else if (vehicleData.batteryHealth < 30) {
    urgency = 'critical';
    message = `CRITICAL: Battery health critically low (${vehicleData.batteryHealth}%). Risk of failure!`;
    recommendations.push("Schedule immediate battery replacement");
    recommendations.push("Carry emergency jump starter");
    recommendations.push("Limit non-essential electrical usage");
  } else if (vehicleData.brakeFluidStatus === 'Needs Replacement') {
    urgency = 'critical';
    message = "CRITICAL: Brake fluid needs immediate replacement!";
    recommendations.push("Drive cautiously to nearest service center");
    recommendations.push("Avoid hard braking");
    recommendations.push("Schedule immediate brake service");
  } else {
    message = "No critical alerts detected. System monitoring continues.";
    recommendations.push("All emergency systems operational");
    recommendations.push("Continue normal operation");
  }
  
  showModal(
    "Emergency AI Alert",
    message,
    "emergency",
    recommendations,
    urgency
  );
  
  addToAnalysisFeed(`Emergency AI: ${urgency.toUpperCase()} status for vehicle ${vehicleData.vehicleId}`);
}

function runPrediction(event) {
  event.stopPropagation();
  
  // Generate predictions based on real vehicle data and driving patterns
  const predictions = [];
  
  // Fuel efficiency predictions
  const currentEfficiency = vehicleData.fuelEfficiency;
  const optimalEfficiency = 22; // Assume optimal for vehicle type
  const improvementPotential = ((optimalEfficiency - currentEfficiency) / currentEfficiency * 100).toFixed(1);
  
  if (improvementPotential > 5) {
    predictions.push(`Fuel efficiency can improve by ${improvementPotential}% with optimized driving habits`);
  } else {
    predictions.push(`Fuel efficiency is near optimal (${currentEfficiency} L/100km)`);
  }
  
  // Maintenance predictions
  const kmToService = vehicleData.nextServiceKm;
  const avgKmPerDay = 50; // Assume average daily driving
  const daysToService = Math.round(kmToService / avgKmPerDay);
  predictions.push(`Next major service recommended in ${kmToService} km (approximately ${daysToService} days)`);
  
  // Component predictions based on current health
  if (vehicleData.batteryHealth < 80) {
    const monthsLeft = Math.round((vehicleData.batteryHealth - 50) / 5); // Rough estimation
    predictions.push(`Battery replacement needed within ${Math.max(1, monthsLeft)} month${monthsLeft !== 1 ? 's' : ''}`);
  }
  
  if (vehicleData.brakePads < 50) {
    const kmLeft = vehicleData.brakePads * 200; // Rough estimation: 200km per 1% of pad life
    predictions.push(`Brake pad replacement suggested in ${kmLeft} km`);
  }
  
  if (vehicleData.tireCondition === 'Worn') {
    predictions.push("Tire replacement recommended within 6 months");
  }
  
  // Driving score analysis
  if (vehicleData.drivingScore < 7) {
    predictions.push(`Driving score improvement potential: Current ${vehicleData.drivingScore}/10 - Target 8.5/10`);
  } else {
    predictions.push(`Excellent driving score: ${vehicleData.drivingScore}/10 - Keep up the good work!`);
  }
  
  // Add eco tips from vehicle data
  vehicleData.ecoTips.forEach(tip => {
    predictions.push(`Eco tip: ${tip}`);
  });
  
  showModal(
    "Predictive AI Analysis",
    `Based on your driving patterns and vehicle data (${vehicleData.vehicleId}), here are the predictions:`,
    "predictive",
    predictions,
    "normal"
  );
  
  addToAnalysisFeed(`Predictive AI: Future maintenance analysis completed for ${vehicleData.vehicleId}`);
}

function viewReport(event) {
  event.stopPropagation();
  
  // Generate comprehensive report from real vehicle data
  const reportData = [
    `Overall vehicle health: ${calculateVehicleHealth()}%`,
    `Performance efficiency: ${Math.round(vehicleData.fuelEfficiency * 4)}%`, // Convert L/100km to efficiency %
    `Safety systems: ${calculateSafetyScore()}%`,
    `Maintenance compliance: ${calculateMaintenanceCompliance()}%`,
    `Battery voltage: ${vehicleData.batteryVoltage}V`,
    `Oil life remaining: ${vehicleData.oilLife}%`,
    `Coolant level: ${vehicleData.coolantLevel}%`,
    `Next service in: ${vehicleData.nextServiceKm} km`
  ];
  
  showModal(
    "Vehicle Health Report",
    `Comprehensive analysis report for vehicle ${vehicleData.vehicleId}:`,
    "diagnostic",
    reportData,
    calculateVehicleHealth() < 70 ? "warning" : "normal"
  );
}

function viewInsights(event) {
  event.stopPropagation();
  
  // Generate insights based on real driving and vehicle data
  const insights = [];
  
  // Driving efficiency insights
  if (vehicleData.drivingScore < 8) {
    insights.push(`Your driving score is ${vehicleData.drivingScore}/10. Focus on smoother acceleration and braking.`);
  } else {
    insights.push(`Excellent driving score: ${vehicleData.drivingScore}/10! You're an eco-friendly driver.`);
  }
  
  // Fuel efficiency insights
  const fuelSavings = Math.max(0, 22 - vehicleData.fuelEfficiency);
  if (fuelSavings > 2) {
    insights.push(`Potential fuel savings: ${fuelSavings.toFixed(1)} L/100km through optimized driving`);
  } else {
    insights.push(`Your fuel efficiency (${vehicleData.fuelEfficiency} L/100km) is excellent!`);
  }
  
  // Maintenance insights
  const maintenanceScore = calculateMaintenanceCompliance();
  if (maintenanceScore < 80) {
    insights.push(`Maintenance score: ${maintenanceScore}% - Stay on top of scheduled services`);
  } else {
    insights.push(`Great maintenance compliance: ${maintenanceScore}%`);
  }
  
  // Add eco tips from vehicle data
  vehicleData.ecoTips.forEach(tip => {
    insights.push(`💡 ${tip}`);
  });
  
  showModal(
    "AI Driving Insights",
    `Personalized insights for vehicle ${vehicleData.vehicleId}:`,
    "predictive",
    insights,
    "normal"
  );
}

function viewMaintenance(event) {
  event.stopPropagation();
  
  // Generate maintenance history and upcoming tasks from real data
  const maintenanceInfo = [];
  
  // Add maintenance history
  if (vehicleData.maintenanceHistory && vehicleData.maintenanceHistory.length > 0) {
    maintenanceInfo.push("📋 Recent Maintenance:");
    vehicleData.maintenanceHistory.forEach(item => {
      maintenanceInfo.push(`• ${item}`);
    });
  }
  
  // Add upcoming tasks
  if (vehicleData.upcomingTasks && vehicleData.upcomingTasks.length > 0) {
    maintenanceInfo.push("🔧 Upcoming Tasks:");
    vehicleData.upcomingTasks.forEach(task => {
      maintenanceInfo.push(`• ${task}`);
    });
  }
  
  // Add service intervals
  maintenanceInfo.push(`🛣️ Next service in: ${vehicleData.nextServiceKm} km`);
  const lastServiceDate = new Date(vehicleData.lastService);
  const daysSinceService = Math.floor((new Date() - lastServiceDate) / (1000 * 60 * 60 * 24));
  maintenanceInfo.push(`📅 Last service: ${daysSinceService} days ago`);
  
  const urgency = vehicleData.nextServiceKm < 500 || vehicleData.upcomingTasks.length > 2 ? "warning" : "normal";
  
  showModal(
    "Maintenance History",
    `Maintenance record for vehicle ${vehicleData.vehicleId}:`,
    "maintenance",
    maintenanceInfo,
    urgency
  );
}

// Helper functions for calculations
function calculateVehicleHealth() {
  const batteryWeight = 0.25;
  const brakeWeight = 0.2;
  const engineWeight = 0.3;
  const oilWeight = 0.15;
  const airFilterWeight = 0.1;
  
  let engineScore = vehicleData.engineStatus === 'Optimal' ? 100 : 
                   vehicleData.engineStatus === 'Check Required' ? 60 : 30;
  
  const health = (
    vehicleData.batteryHealth * batteryWeight +
    vehicleData.brakePads * brakeWeight +
    engineScore * engineWeight +
    vehicleData.oilLife * oilWeight +
    vehicleData.airFilterHealth * airFilterWeight
  );
  
  return Math.round(health);
}

function calculateSafetyScore() {
  const brakeScore = vehicleData.brakePads;
  const tireScore = vehicleData.tireCondition === 'Good' ? 100 : 
                   vehicleData.tireCondition === 'Worn' ? 60 : 30;
  const fluidScore = vehicleData.brakeFluidStatus === 'Good' ? 100 : 50;
  
  return Math.round((brakeScore + tireScore + fluidScore) / 3);
}

function calculateMaintenanceCompliance() {
  let score = 100;
  
  if (vehicleData.oilLife < 20) score -= 20;
  if (vehicleData.airFilterHealth < 50) score -= 15;
  if (vehicleData.nextServiceKm < 500) score -= 15;
  if (vehicleData.brakeFluidStatus === 'Needs Replacement') score -= 25;
  if (vehicleData.upcomingTasks.length > 2) score -= 10;
  
  return Math.max(0, score);
}

function contactService(event) {
  event.stopPropagation();
  
  showModal(
    "Emergency Contact",
    "Contacting nearest NexesCare service center...",
    "emergency",
    ["📞 Service Center: (555) 123-4567", "🚗 Mobile Service: Available", "⏰ Estimated arrival: 25 minutes"],
    "critical"
  );
  
  addToAnalysisFeed("Emergency AI: Service center contacted");
}

// === DEMO CONTROL FUNCTIONS ===
function simulateBatteryIssue() {
  // Update battery status
  const batteryCard = document.querySelector('.data-card .data-content h4');
  const batteryCards = document.querySelectorAll('.data-card');
  
  batteryCards.forEach(card => {
    const title = card.querySelector('h4');
    if (title && title.textContent === 'Battery Health') {
      const value = card.querySelector('.data-value');
      value.textContent = '23%';
      value.className = 'data-value critical';
    }
  });
  
  // Trigger emergency alert
  setTimeout(() => {
    emergencyMode({ stopPropagation: () => {} });
  }, 1000);
  
  addToAnalysisFeed("Demo: Battery issue simulation activated");
}

function simulateEngineCheck() {
  const engineCards = document.querySelectorAll('.data-card');
  
  engineCards.forEach(card => {
    const title = card.querySelector('h4');
    if (title && title.textContent === 'Engine Status') {
      const value = card.querySelector('.data-value');
      value.textContent = 'Check Required';
      value.className = 'data-value warning';
    }
  });
  
  setTimeout(() => {
    runDiagnostic({ stopPropagation: () => {} });
  }, 1500);
  
  addToAnalysisFeed("Demo: Engine diagnostic simulation started");
}

function simulateServiceAlert() {
  scheduleService({ stopPropagation: () => {} });
  addToAnalysisFeed("Demo: Service alert simulation triggered");
}

function generatePrediction() {
  runPrediction({ stopPropagation: () => {} });
  addToAnalysisFeed("Demo: Predictive analysis simulation started");
}

function toggleDemoPanel() {
  const panel = document.getElementById('demo-panel');
  panel.classList.toggle('active');
}

// === ENHANCED VEHICLE COMPONENT INTERACTIONS ===
function setupComponentInteractions() {
  // Add click interactions to vehicle components
  const vehicleComponents = document.querySelectorAll('[data-component]');
  
  vehicleComponents.forEach(component => {
    component.addEventListener('click', (e) => {
      e.stopPropagation();
      const componentName = component.getAttribute('data-component');
      const status = component.getAttribute('data-status') || 'good';
      
      showComponentDetails(componentName, status);
    });
    
    // Add hover effects for 3D components
    component.addEventListener('mouseenter', (e) => {
      component.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.8)';
      component.style.transform = 'scale(1.05)';
      
      // Show tooltip
      showComponentTooltip(e, componentName, status);
    });
    
    component.addEventListener('mouseleave', () => {
      component.style.boxShadow = '';
      component.style.transform = '';
      
      // Hide tooltip
      hideComponentTooltip();
    });
  });
  
  // Add interactions to component analysis panel items
  const componentItems = document.querySelectorAll('.component-item');
  componentItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const componentName = item.getAttribute('data-component');
      const status = item.querySelector('.status-badge').className.includes('warning') ? 'warning' : 'good';
      
      showComponentDetails(componentName, status);
      
      // Highlight corresponding 3D component
      const vehicleComponent = document.querySelector(`[data-component="${componentName}"]`);
      if (vehicleComponent) {
        vehicleComponent.style.boxShadow = '0 0 30px rgba(0, 212, 255, 1)';
        vehicleComponent.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
          vehicleComponent.style.boxShadow = '';
          vehicleComponent.style.transform = '';
        }, 2000);
      }
    });
  });
}

function showComponentTooltip(event, componentName, status) {
  const tooltip = document.getElementById('component-tooltip');
  const title = document.getElementById('tooltip-title');
  const statusElement = document.getElementById('tooltip-status');
  const description = document.getElementById('tooltip-description');
  
  const componentInfo = {
    battery: {
      name: "Vehicle Battery",
      description: "12V Lead-acid battery providing electrical power",
      status: status === 'warning' ? "78% - Replace Soon" : "Healthy"
    },
    engine: {
      name: "Engine System",
      description: "Internal combustion engine - primary power source",
      status: "Optimal Performance"
    },
    brakes: {
      name: "Brake System",
      description: "Hydraulic disc brake system",
      status: status === 'warning' ? "Pads 25% - Service Required" : "Optimal"
    },
    hood: {
      name: "Engine Hood",
      description: "Protective cover for engine bay",
      status: "Normal"
    },
    roof: {
      name: "Vehicle Roof",
      description: "Main structural element",
      status: "Excellent"
    },
    trunk: {
      name: "Trunk/Boot",
      description: "Rear storage compartment",
      status: "Normal"
    },
    transmission: {
      name: "Transmission",
      description: "Power transfer system",
      status: "Excellent"
    },
    cooling: {
      name: "Cooling System",
      description: "Engine temperature regulation",
      status: "Normal Temperature"
    }
  };
  
  const info = componentInfo[componentName] || {
    name: componentName.replace('-', ' ').toUpperCase(),
    description: "Vehicle component",
    status: status === 'warning' ? 'Needs Attention' : 'Good'
  };
  
  title.textContent = info.name;
  statusElement.textContent = `Status: ${info.status}`;
  description.textContent = info.description;
  
  // Position tooltip near cursor
  tooltip.style.left = event.pageX + 'px';
  tooltip.style.top = (event.pageY - tooltip.offsetHeight - 10) + 'px';
  tooltip.classList.add('show');
}

function hideComponentTooltip() {
  const tooltip = document.getElementById('component-tooltip');
  tooltip.classList.remove('show');
}

function showComponentDetails(componentName, status) {
  const componentInfo = {
    battery: {
      name: "Vehicle Battery",
      description: "12V Lead-acid battery providing electrical power",
      recommendations: status === 'warning' ? ["Replace within 1 week", "Check connections", "Test charging system"] : ["Battery is healthy", "Regular maintenance on schedule"]
    },
    engine: {
      name: "Engine System",
      description: "Internal combustion engine - primary power source",
      recommendations: ["Engine performance optimal", "Next service in 2,500 km", "Oil life remaining: 60%"]
    },
    brakes: {
      name: "Brake System",
      description: "Hydraulic disc brake system",
      recommendations: status === 'warning' ? ["Brake pads at 25%", "Service recommended in 2 weeks", "Check brake fluid level"] : ["Brake system optimal", "Regular inspection scheduled"]
    }
  };
  
  const info = componentInfo[componentName] || {
    name: componentName.replace('-', ' ').toUpperCase(),
    description: "Vehicle component",
    recommendations: ["Component status: " + status]
  };
  
  showModal(
    info.name,
    info.description,
    "diagnostic",
    info.recommendations,
    status === 'warning' ? 'warning' : 'normal'
  );
}

// Initialize component interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setupComponentInteractions();
  
  // Initialize demo panel
  setTimeout(() => {
    const demoPanel = document.getElementById('demo-panel');
    if (demoPanel) {
      demoPanel.style.display = 'block';
    }
  }, 3000);
});

// Add modal close on background click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal-overlay');
  if (e.target === modal) {
    closeModal();
  }
});

// Initialize everything when the page loads
console.log('NexesCare AI System Initialized - Enhanced with Interactive Features');