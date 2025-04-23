const API_URL = '/api/search'; // Flask backend endpoint

// Format the phone number as XXX-XXX-XXXX while the user types
function formatPhoneInput(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, ''); // Remove all non-digit characters

  // Limit input to 10 digits
  if (value.length > 10) {
    value = value.slice(0, 10);
  }

  // Format the phone number
  if (value.length > 6) {
    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
  } else if (value.length > 3) {
    value = `${value.slice(0, 3)}-${value.slice(3)}`;
  }

  input.value = value;
}

// Utility function to format names
function formatName(name) {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// Validate phone number format
function validatePhoneNumber(phone) {
  const digitsOnly = phone.replace(/\D/g, ''); // Remove all non-digit characters
  const phoneRegex = /^\d{10}$/; // Matches exactly 10 digits
  return phoneRegex.test(digitsOnly);
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format regex
  return emailRegex.test(email);
}

function showModal(message) {
  console.log('Modal Triggered:', message); // Debugging
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const modalOverlay = document.getElementById('modalOverlay');

  if (modal && modalMessage && modalOverlay) {
    modalMessage.textContent = message;
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    console.log('Modal displayed successfully'); // Debugging
    console.log('Modal styles:', modal.style.cssText); // Check styles
  } else {
    console.error('Modal elements not found'); // Debugging
  }
}

function hideModal() {
  const modal = document.getElementById('modal');
  const modalOverlay = document.getElementById('modalOverlay');
  modal.style.display = 'none';
  modalOverlay.style.display = 'none';
  console.log("Modal hidden");
}


// Show the loading modal
function showLoadingModal() {
  const loadingModal = document.createElement('div');
  loadingModal.id = 'loading-modal';
  loadingModal.style.position = 'fixed';
  loadingModal.style.top = 0;
  loadingModal.style.left = 0;
  loadingModal.style.width = '100%';
  loadingModal.style.height = '100%';
  loadingModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  loadingModal.style.display = 'flex';
  loadingModal.style.justifyContent = 'center';
  loadingModal.style.alignItems = 'center';
  loadingModal.style.zIndex = '10000';

  const loadingText = document.createElement('div');
  loadingText.style.color = '#fff';
  loadingText.style.fontSize = '1.5em';
  loadingText.textContent = 'Submitting your details...';

  loadingModal.appendChild(loadingText);
  document.body.appendChild(loadingModal);
}

// Hide the loading modal
function hideLoadingModal() {
  const loadingModal = document.getElementById('loading-modal');
  if (loadingModal) {
    document.body.removeChild(loadingModal);
  }
}

// Display thank-you message
function displayThankYouMessage() {
  document.body.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h1>Thanks for your interest!</h1>
      <p>We're reviewing your details and will be in touch shortly.</p>
      <p>If you have questions in the meantime, please email <a href="mailto:bbourque@smartasset.com">bbourque@smartasset.com</a>.</p>
    </div>
  `;
}

// Capture device and browser information
function getUserDeviceInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  let deviceType = "Desktop"; // Default to desktop

  // Check for mobile devices
  if (/android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile|Mobile/i.test(userAgent)) {
    deviceType = "Mobile";
  }

  // Check for tablets
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent) || (window.screen.width >= 600 && window.screen.width <= 1024)) {
    deviceType = "Tablet";
  }

  // Extract browser name and version
  function getBrowserName() {
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
      return `Chrome ${userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || "Unknown"}`;
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      return `Safari ${userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || "Unknown"}`;
    } else if (userAgent.includes("Firefox")) {
      return `Firefox ${userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || "Unknown"}`;
    } else if (userAgent.includes("Edg")) {
      return `Edge ${userAgent.match(/Edg\/(\d+\.\d+)/)?.[1] || "Unknown"}`;
    } else if (userAgent.includes("Opera") || userAgent.includes("OPR")) {
      return `Opera ${userAgent.match(/(Opera|OPR)\/(\d+\.\d+)/)?.[2] || "Unknown"}`;
    } else {
      return "Unknown Browser";
    }
  }

  return {
    deviceType: deviceType,
    browser: getBrowserName(),
    browserLanguage: navigator.language
  };
}

// Function to capture UTM parameters from the URL
function getUTMParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source') || 'N/A',
    utm_medium: urlParams.get('utm_medium') || 'N/A',
    utm_term: urlParams.get('utm_term') || 'N/A',
    utm_content: urlParams.get('utm_content') || 'N/A',
    utm_campaign: urlParams.get('utm_campaign') || 'N/A'
  };
}

// Store UTM parameters in a global variable
const UTM_DATA = getUTMParameters();


// Search advisor by first name and last name
async function searchAdvisor() {
  let firstName = document.getElementById('firstName').value.trim();
  let lastName = document.getElementById('lastName').value.trim();

  if (!lastName) {
    showModal('Please enter your last name to search.');
    return;
  }

  firstName = formatName(firstName);
  lastName = formatName(lastName);

  let query = `Info.lastNm:${lastName}`;
  if (firstName) query += ` AND Info.firstNm:${firstName}`;
  query += ` AND CrntEmps.CrntEmp.CrntRgstns.CrntRgstn.regCat:RA`; // Restrict to RIAs

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, size: 50 }),
    });

    const data = await response.json();
    if (data.filings && data.filings.length > 0) {
      displayResults(data.filings);
    } else {
      showModal('No RIAs found matching your criteria. Please refine your search.');
    }
  } catch (error) {
    showModal('An error occurred. Please try again.');
  }
}

function displayResults(data) {
  const resultsContainer = document.getElementById('results');
  const resultsList = document.getElementById('results-list');
  const searchSection = document.getElementById('search-section');

  resultsList.innerHTML = ''; // Clear previous results
  
  // Hide the search section
  searchSection.style.display = 'none';

  resultsContainer.style.display = 'block';

  data.forEach((advisor, index) => {
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.innerHTML = `
      <span>${index + 1}. ${advisor.Info.firstNm.toUpperCase()} ${advisor.Info.lastNm.toUpperCase()} (${advisor.Info.indvlPK})</span>
      <span>${advisor.CrntEmps?.CrntEmp[0]?.orgNm || 'No firm information available'}</span>
      <span>Registered Investment Adviser (RIA)</span>
    `;

  // Add click event to populate form
  resultItem.addEventListener('click', () => populateForm(advisor));
  resultsList.appendChild(resultItem);
});

  // Add "Modify Search" text link at the bottom
  const modifySearchLink = document.createElement('div');
  modifySearchLink.style.textAlign = 'center';
  modifySearchLink.style.marginTop = '20px';
  modifySearchLink.innerHTML = `
    <a href="#" onclick="resetSearch()">Modify Search</a>
  `;
  resultsList.appendChild(modifySearchLink);

}

function populateForm(advisor) {
  const formSection = document.getElementById('form-section');
  const resultsContainer = document.getElementById('results');
  const searchSection = document.getElementById('search-section');
  const contentWrapper = document.getElementById('content-wrapper'); // Assuming this is the parent wrapper for content sections
  const footer = document.getElementById('generic-footer'); // Generic footer ID, update if necessary

  // Populate form fields
  document.getElementById('formFirstName').value = advisor.Info.firstNm || '';
  document.getElementById('formLastName').value = advisor.Info.lastNm || '';
  document.getElementById('formFirmName').value =
    advisor.CrntEmps?.CrntEmp[0]?.orgNm || 'No firm information available';
  document.getElementById('formCRD').value = advisor.Info.indvlPK || 'Unavailable';

  // Hide the search form and results
  searchSection.style.display = 'none'; // Hide the initial search form
  resultsContainer.style.display = 'none'; // Hide the results list
  // beginning of problem
  /*if (contentWrapper) {
    contentWrapper.style.display = 'none'; // Hide other content if applicable
  }*/
  // end of problem 
  if (footer) {
    footer.style.display = 'block'; // Show the generic footer
  }
  // Show the form section
  formSection.style.display = 'block';

  // Scroll to the form section
  formSection.scrollIntoView({ behavior: 'smooth' });
}

// Handle form submission
async function submitForm() {
  const phone = document.getElementById('formPhone').value;
  const email = document.getElementById('formEmail').value;
  const isFiduciary = document.getElementById('formFiduciary').checked;

  // Validate phone number
  if (!phone || !validatePhoneNumber(phone)) {
    showModal('Please enter a valid 10-digit phone number.');
    return;
  }

  // Validate email
  if (!email || !validateEmail(email)) {
    showModal('Please enter a valid email address.');
    return;
  }

  if (!isFiduciary) {
    showModal('You must be a fiduciary to use this service.');
    return;
  }

  // enerate reCAPTCHA token
  const recaptchaToken = await grecaptcha.execute('6Le7Tt8qAAAAAApQme1oXaJlgQIionNz0n-W8WFU', { action: 'submit' });


  const formData = {
    firstName: document.getElementById('formFirstName').value,
    lastName: document.getElementById('formLastName').value,
    firmName: document.getElementById('formFirmName').value,
    crdNumber: document.getElementById('formCRD').value,
    phone,
    email,
    isFiduciary,
    deviceInfo: getUserDeviceInfo(), // Includes deviceType (Mobile/Tablet/Desktop)
    utmData: UTM_DATA, // UTM parameters
    recaptchaToken
  };

   try {
    showLoadingModal();
    const response = await fetch('/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    hideLoadingModal();

    if (result.status === 'success') {
      displayThankYouMessage();
      // 🔥 Show Chili Piper calendar popup
      ChiliPiper.scheduling("smartasset", "unbounce-router", {
        title: "Thanks! What time works best for a quick call?",
        userEmail: email,
        userFirstName: formData.firstName,
        userLastName: formData.lastName,
        userPhone: phone
      });
    } else {
      showModal('Error: ' + result.message);
    }
  } catch (error) {
    hideLoadingModal();
    showModal('An error occurred while submitting the form.');
  }
}

function scrollToForm() {
  const formSection = document.getElementById('search-section'); // Ensure this targets the correct section
  const lastNameField = document.getElementById('lastName'); // Specifically target the Last Name field

  if (formSection && lastNameField) {
    // Scroll to the form section
    const offset = -50; // Adjust for spacing above the form
    const yPosition = formSection.getBoundingClientRect().top + window.pageYOffset + offset;

    window.scrollTo({
      top: yPosition,
      behavior: 'smooth'
    });

    // Highlight the Last Name field
    lastNameField.style.border = '2px solid #FF5733'; // Add an orange border
    lastNameField.style.backgroundColor = '#e6f7ff'; // Add a light blue background

    // Remove the highlight after 3 seconds
    setTimeout(() => {
      lastNameField.style.border = '1px solid #ccc'; // Reset to default border
      lastNameField.style.backgroundColor = '#fff'; // Reset to default background
    }, 3000); // Highlight lasts for 3 seconds
  } else {
    console.error('Form section or Last Name field not found!');
  }
}

// Handle "Modify Advisor Search"
function resetSearch() {
  const searchSection = document.getElementById('search-section');
  const resultsContainer = document.getElementById('results');
  const formSection = document.getElementById('form-section');

  // Reset UI visibility
  searchSection.style.display = 'block'; // Show the search form again
  resultsContainer.style.display = 'none'; // Hide the results section
  formSection.style.display = 'none'; // Hide the form section

  // Clear any search inputs
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('formPhone');
  phoneInput.addEventListener('input', formatPhoneInput); // Real-time phone formatting
});
