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