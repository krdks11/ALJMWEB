const originalPositions = [];

document.querySelectorAll('.div_box').forEach(divBox => {
    const gridImg = divBox.querySelector('#grid_img');
    if (gridImg) {
        originalPositions.push({ parent: divBox, element: gridImg, nextSibling: gridImg.nextSibling });
    }
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

    // console.log(window.innerWidth);
}

window.addEventListener('resize', newImgOrder);

// Initial call to set the correct order based on the current window size
newImgOrder();
