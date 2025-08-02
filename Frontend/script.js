/* filepath: c:\Users\vimal\OneDrive\Apps\Desktop\front_end_of_ux_project\script.js */
// ================== AUTOCARE360 3D VEHICLE DIAGNOSTIC SYSTEM ==================

// === GLOBAL VARIABLES ===
let isAnimating = true;
let currentViewMode = 'normal';
let selectedAgent = null;
let feedActive = true;
let vehicleRotation = { x: 0, y: 0, z: 0 };

// === VEHICLE DATA SIMULATION ===
const vehicleData = {
  mileage: 72458,
  batteryHealth: 78,
  engineStatus: "Optimal",
  lastService: "45 days ago",
  brakePads: "Worn - 25%",
  coolantLevel: "Good",
  oilLife: "60%",
  tireCondition: "Good"
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
  initializeParticles();
  simulateLoading();
  initializeAgents();
  startLiveDataUpdates();
  setupEventListeners();
  initializeComponentTooltips();
});

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
    { progress: 100, text: "AutoCare360 Ready!" }
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
  updateAgentStatus('diagnostic', 'active', 'Analyzing vehicle systems... 2 issues detected.');
  updateAgentStatus('maintenance', 'standby', 'Next service due in 2,500 km. Brake pads need attention.');
  updateAgentStatus('emergency', 'alert', 'Battery voltage low. Recommend immediate attention.');
  updateAgentStatus('predictive', 'learning', 'Analyzing driving patterns... Fuel efficiency can improve by 12%.');
}

function updateAgentStatus(agentId, status, message) {
  const agent = document.getElementById(agentId + '-agent');
  const statusElement = agent.querySelector('.agent-status');
  const suggestionElement = agent.querySelector('.agent-suggestion');
  
  statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  statusElement.className = 'agent-status ' + status;
  suggestionElement.textContent = message;
  
  // Update visual indicators
  const avatar = agent.querySelector('.agent-avatar');
  const pulseRing = agent.querySelector('.pulse-ring');
  
  if (status === 'alert' || status === 'warning') {
    avatar.classList.add('warning');
    pulseRing.classList.add('warning');
  } else {
    avatar.classList.remove('warning');
    pulseRing.classList.remove('warning');
  }
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

// === 3D CONTROLS ===
function setViewMode(mode) {
  currentViewMode = mode;
  
  // Update button states
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  const vehicleModel = document.getElementById('vehicle-model');
  
  // Reset classes
  vehicleModel.className = 'car';
  
  // Apply mode
  switch (mode) {
    case 'xray':
      vehicleModel.classList.add('xray-mode');
      break;
    case 'thermal':
      vehicleModel.classList.add('thermal-mode');
      break;
    case 'diagnostic':
      vehicleModel.classList.add('diagnostic-mode');
      startAIScan();
      break;
  }
  
  addToAnalysisFeed(`Vehicle view mode changed to ${mode}`);
}

function rotateVehicle(direction) {
  const vehicleModel = document.getElementById('vehicle-model');
  
  switch (direction) {
    case 'left':
      vehicleRotation.y -= 45;
      break;
    case 'right':
      vehicleRotation.y += 45;
      break;
    case 'up':
      vehicleRotation.x -= 45;
      break;
    case 'down':
      vehicleRotation.x += 45;
      break;
  }
  
  vehicleModel.style.transform = `rotateX(${vehicleRotation.x}deg) rotateY(${vehicleRotation.y}deg)`;
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
  // Simulate real-time data updates
  setInterval(() => {
    updateVehicleData();
    updateAgentProgress();
  }, 5000);
}

function updateVehicleData() {
  // Simulate slight changes in vehicle data
  vehicleData.mileage += Math.floor(Math.random() * 5);
  vehicleData.batteryHealth += (Math.random() - 0.5) * 2;
  vehicleData.batteryHealth = Math.max(0, Math.min(100, vehicleData.batteryHealth));
  
  // Update UI
  document.getElementById('mileage').textContent = vehicleData.mileage.toLocaleString() + ' km';
  document.getElementById('battery').textContent = Math.round(vehicleData.batteryHealth) + '%';
  
  // Update battery status class
  const batteryElement = document.getElementById('battery');
  if (vehicleData.batteryHealth < 80) {
    batteryElement.className = 'data-value warning';
  } else {
    batteryElement.className = 'data-value good';
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
  addFeedItem("System: Action acknowledged and processed");
  closeModal();
}

// === ENHANCED AGENT INTERACTIONS ===
function runDiagnostic(event) {
  event.stopPropagation();
  
  // Simulate diagnostic process
  const diagnosticAgent = document.getElementById('diagnostic-agent');
  const suggestion = document.getElementById('diagnostic-suggestion');
  
  // Update agent status
  suggestion.textContent = "Running comprehensive diagnostic...";
  
  setTimeout(() => {
    const mockResults = [
      "Battery voltage: 11.8V (Low - Replace recommended)",
      "Brake pads: 25% remaining (Service in 2 weeks)",
      "Engine oil: Good condition",
      "Tire pressure: All within normal range",
      "Air filter: 75% efficiency (Good)"
    ];
    
    const recommendations = [
      "Replace battery within 1 week",
      "Schedule brake service in 2 weeks",
      "Continue regular maintenance schedule"
    ];
    
    showModal(
      "Diagnostic AI Report", 
      "Full system diagnostic completed. 2 issues require attention.", 
      "diagnostic",
      recommendations,
      "warning"
    );
    
    suggestion.textContent = "Diagnostic complete - 2 issues detected.";
    addFeedItem("Diagnostic AI: Full system scan completed");
  }, 2000);
}

function scheduleService(event) {
  event.stopPropagation();
  
  const recommendations = [
    "Oil change due in 500 km",
    "Brake inspection recommended",
    "Battery replacement suggested",
    "Next service: Engine tune-up"
  ];
  
  showModal(
    "Maintenance AI Scheduler",
    "Service appointment has been scheduled for next Tuesday at 10:00 AM.",
    "maintenance",
    recommendations,
    "normal"
  );
  
  addFeedItem("Maintenance AI: Service appointment scheduled");
}

function emergencyMode(event) {
  event.stopPropagation();
  
  const recommendations = [
    "Pull over safely if driving",
    "Turn off non-essential electronics",
    "Contact roadside assistance",
    "Do not attempt to restart if engine fails"
  ];
  
  showModal(
    "Emergency AI Alert",
    "CRITICAL: Battery voltage critically low. Immediate action required!",
    "emergency",
    recommendations,
    "critical"
  );
  
  addFeedItem("Emergency AI: CRITICAL ALERT - Battery failure imminent");
}

function runPrediction(event) {
  event.stopPropagation();
  
  const predictions = [
    "Fuel efficiency can improve by 12% with optimized driving",
    "Next major service recommended in 3,200 km",
    "Battery replacement needed within 30 days",
    "Tire replacement suggested in 6 months"
  ];
  
  showModal(
    "Predictive AI Analysis",
    "Based on your driving patterns and vehicle data, here are the predictions:",
    "predictive",
    predictions,
    "normal"
  );
  
  addFeedItem("Predictive AI: Future maintenance analysis completed");
}

function viewReport(event) {
  event.stopPropagation();
  
  const reportData = [
    "Overall vehicle health: 78%",
    "Performance efficiency: 85%",
    "Safety systems: 92%",
    "Maintenance compliance: 70%"
  ];
  
  showModal(
    "Vehicle Health Report",
    "Comprehensive vehicle analysis report generated.",
    "diagnostic",
    reportData,
    "normal"
  );
}

function viewInsights(event) {
  event.stopPropagation();
  
  const insights = [
    "Your acceleration patterns suggest 8% fuel savings potential",
    "Optimal service intervals can extend engine life by 15%",
    "Current driving score: 8.2/10",
    "Recommended eco-driving techniques available"
  ];
  
  showModal(
    "AI Driving Insights",
    "Personalized insights based on your driving behavior:",
    "predictive",
    insights,
    "normal"
  );
}

function viewMaintenance(event) {
  event.stopPropagation();
  
  const history = [
    "Last oil change: 2,500 km ago",
    "Brake service: 6 months ago",
    "Tire rotation: 1 month ago",
    "Battery test: Overdue"
  ];
  
  showModal(
    "Maintenance History",
    "Your vehicle's maintenance record:",
    "maintenance",
    history,
    "warning"
  );
}

function contactService(event) {
  event.stopPropagation();
  
  showModal(
    "Emergency Contact",
    "Contacting nearest AutoCare360 service center...",
    "emergency",
    ["📞 Service Center: (555) 123-4567", "🚗 Mobile Service: Available", "⏰ Estimated arrival: 25 minutes"],
    "critical"
  );
  
  addFeedItem("Emergency AI: Service center contacted");
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
  
  addFeedItem("Demo: Battery issue simulation activated");
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
  
  addFeedItem("Demo: Engine diagnostic simulation started");
}

function simulateServiceAlert() {
  scheduleService({ stopPropagation: () => {} });
  addFeedItem("Demo: Service alert simulation triggered");
}

function generatePrediction() {
  runPrediction({ stopPropagation: () => {} });
  addFeedItem("Demo: Predictive analysis simulation started");
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
console.log('AutoCare360 AI System Initialized - Enhanced with Interactive Features');