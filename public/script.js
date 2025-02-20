const originalPositions = [];
let footerDetail;
let footerMap;
let footerService;
let detailSmallDevice;
let originalContainer;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize footer elements
    footerDetail = document.querySelector(".footer-details");
    detailSmallDevice = document.querySelector(".footer-details-small-device");
    originalContainer = document.querySelector(".footer-main");
    footerMap = document.querySelector(".footer-map");
    footerService = document.querySelector(".footer-service");

    // Store original image positions
    document.querySelectorAll('.div_box').forEach(divBox => {
        const gridImg = divBox.querySelector('#grid_img');
        if (gridImg) {
            originalPositions.push({ parent: divBox, element: gridImg, nextSibling: gridImg.nextSibling });
        }
    });

    // Initial calls
    newImgOrder();
    handleFooterLayout();

    // Add event listeners
    window.addEventListener('resize', () => {
        newImgOrder();
        handleFooterLayout();
    });
});

function newImgOrder() {
    if (window.innerWidth <= 674) {
        document.querySelectorAll('.div_box').forEach(divBox => {
            const gridImg = divBox.querySelector('#grid_img');
            if (gridImg) {
                divBox.insertBefore(gridImg, divBox.firstChild);
            }
        });
    } else {
        originalPositions.forEach(({ parent, element, nextSibling }) => {
            parent.insertBefore(element, nextSibling);
        });
    }
}

function handleFooterLayout() {
    if (!footerDetail || !detailSmallDevice || !originalContainer || !footerMap || !footerService) {
        return; // Exit if elements don't exist
    }

    if (window.innerWidth <= 850) {
        if (footerDetail.parentElement !== detailSmallDevice) {
            footerDetail.remove();
            detailSmallDevice.appendChild(footerDetail);
            footerDetail.style.width = "100%";
            detailSmallDevice.style.padding = "1rem";
            originalContainer.classList.add("hr-grey");
        }
    } else {
        if (footerDetail.parentElement !== originalContainer) {
            footerDetail.remove();
            originalContainer.prepend(footerDetail);
            footerDetail.style.width = "";
            detailSmallDevice.style.padding = "";
            originalContainer.classList.remove("hr-grey");
        }
    }

    if (window.innerWidth <= 530) {
        if (footerMap.parentElement) {
            footerMap.remove();
        }
    } else {
        if (!footerMap.parentElement && footerService) {
            footerService.insertAdjacentElement('afterend', footerMap);
        }
    }
}

// Header scroll functionality
var prevScrollPos = window.pageYOffset;
window.onscroll = function() {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollPos > currentScrollPos) {
        document.querySelector("header").style.top = "0";
    } else {
        document.querySelector("header").style.top = "-90px";
    }
    prevScrollPos = currentScrollPos;
};

// Form validation
document.addEventListener('DOMContentLoaded', function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', function (event) {
            event.preventDefault(); // Always prevent default first
            
            // Check name
            const nameInput = form.querySelector('#name');
            if (nameInput && nameInput.value.trim().length < 2) {
                nameInput.setCustomValidity('Name must be at least 2 characters');
            } else if (nameInput) {
                nameInput.setCustomValidity('');
            }

            // Check email
            const emailInput = form.querySelector('#email');
            if (emailInput && (!emailInput.value.trim() || !emailInput.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))) {
                emailInput.setCustomValidity('Please enter a valid email address');
            } else if (emailInput) {
                emailInput.setCustomValidity('');
            }

            // Check service
            const serviceInput = form.querySelector('#service');
            if (serviceInput && (!serviceInput.value || serviceInput.value === "")) {
                serviceInput.setCustomValidity('Please select a service');
            } else if (serviceInput) {
                serviceInput.setCustomValidity('');
            }

            // Check location
            const locationInput = form.querySelector('#location');
            if (locationInput && locationInput.value.trim().length < 2) {
                locationInput.setCustomValidity('Location must be at least 2 characters');
            } else if (locationInput) {
                locationInput.setCustomValidity('');
            }

            // Check message
            const messageInput = form.querySelector('#message');
            if (messageInput && messageInput.value.trim().length < 10) {
                messageInput.setCustomValidity('Message must be at least 10 characters');
            } else if (messageInput) {
                messageInput.setCustomValidity('');
            }

            // Add validation class to show feedback
            form.classList.add('was-validated');

            // If the form is valid, submit it
            if (form.checkValidity()) {
                form.submit();
            }
        });

        // Real-time validation for all inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                // Remove custom validity as user types
                this.setCustomValidity('');
                
                if (this.id === 'email' && this.value) {
                    if (!this.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                        this.setCustomValidity('Please enter a valid email address');
                    }
                }
                
                if (this.id === 'message' && this.value) {
                    if (this.value.trim().length < 10) {
                        this.setCustomValidity('Message must be at least 10 characters');
                    }
                }

                if ((this.id === 'name' || this.id === 'location') && this.value) {
                    if (this.value.trim().length < 2) {
                        this.setCustomValidity('Minimum 2 characters required');
                    }
                }

                // Show validation feedback
                if (this.form.classList.contains('was-validated')) {
                    this.form.classList.remove('was-validated');
                    this.form.classList.add('was-validated');
                }
            });
        });
    });

    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const closeButton = alert.querySelector('.btn-close');
            if (closeButton) {
                closeButton.click();
            }
        }, 5000);
    });
});