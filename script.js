
function zoomPlus()
{
    let svgElement = document.getElementById("svg_image");
    svgElement.currentScale += 0.1;
    svgElement.currentTranslate.x -= 20;
    svgElement.currentTranslate.y -= 20;

    svgElement.style.width = parseInt(svgElement.style.width) + 10 + 'px';
    svgElement.style.height = parseInt(svgElement.style.height) + 10 + 'px';
}

function zoomMoins()
{
    let svgElement = document.getElementById("svg_image");
    svgElement.currentScale -= 0.1;
    svgElement.currentTranslate.x += 20;
    svgElement.currentTranslate.y += 20;

    svgElement.style.width = parseInt(svgElement.style.width) - 10 + 'px';
    svgElement.style.height = parseInt(svgElement.style.height) - 10 + 'px';
}

function show(id)
{
    let element = document.getElementById(id);
    if(element != undefined)
    {
        element.style.display = 'block';
    }

}

function hide(id)
{
    let element = document.getElementById(id);
    if(element != undefined)
    {
        element.style.display = 'none';
    }

}

document.getElementById("zoomplus").addEventListener('click', zoomPlus);
document.getElementById("zoommoins").addEventListener('click', zoomMoins);


/*let domaine = document.getElementById("form_domaine");

domaine.style.height = window.innerHeight + 'px';
alert(window.innerHeight);
domaine.style.overflow = 'auto';
*/
