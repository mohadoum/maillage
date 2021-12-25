/* cette variable compte le nombre de points disponibles */
var pointsCounter = 1;
var baseDesPoints = [];
var estCorrecteDomaine = false;
var baseDesTrianglesFinis = [];
var baseDesTrianglesInfinis = [];
var estMaille = false;

function addPoint()
{
    pointsCounter ++;
    let container = document.forms[0].getElementsByTagName('div')[0].getElementsByClassName('points')[0];
    let points = container.getElementsByClassName('point');
    let innerPoint = '<div class="row input-group point" id="point_'+ pointsCounter +'">'; 
        innerPoint += '<h3>Point numero ' + (points!=undefined ? (points.length + 1) : 1) + '</h3>';
        innerPoint += '<div class="col-md-6">';
        innerPoint += '<h5>Abscisse</h5>';
        innerPoint +=  '<input type="text" class="input form-control" required>';
        innerPoint += '</div>';
        innerPoint += '<div class="col-md-6">';
        innerPoint += '<h5>Ordonnée</h5>';
        innerPoint += '<input type="text" class="input form-control" required> </div> </div> <br>';
    let newPoint = document.createElement('div');
    newPoint.classList.add = "row input-group";
    container.insertBefore(newPoint, container.getElementsByClassName('form-footer')[0]);
    newPoint.innerHTML = innerPoint;

}

function cleanPoints()
{
    pointsCounter = 0;
    let container = document.forms[0].getElementsByTagName('div')[0].getElementsByClassName('points')[0];
    container.innerHTML = "";
    /* on en ajoute un nouveau */
    addPoint();
}


/**
 * un baseDePoint est correcte si:
 *   1- Toutes les coordonnees sont convertibles en type number
*/ 
function estCorrecteBaseDesPoints(base)
{
    if(Array.isArray(base)){
        for(let i=0; i<base.length; i++)
        {
            let point = base[i];
            if(isNaN(Number(point.x)) || isNaN(Number(point.y)))
            {
                return false;
            }

            /* On change les string en number */
            point.x = Number(point.x);
            point.y = Number(point.y);

        }
    }else
    {
        return false;
    }

    return true;
}

/**
 * Cette fonction retourne la valeur d'abscisse maximale
 * @param {*} baseDesPoints 
 */
function maxX(baseDesPoints)
{
    let max = baseDesPoints[0].x;
    for(let i=1; i<baseDesPoints.length; i++)
    {
        if(baseDesPoints[i].x > max)
        {
            max = baseDesPoints[i].x;
        }
    }
    return max;
}


/**
 * Cette fonction retourne la valeur d'ordonnée maximale
 * @param {*} baseDesPoints 
 */
function maxY(baseDesPoints)
{
    let max = baseDesPoints[0].y;
    for(let i=1; i<baseDesPoints.length; i++)
    {
        if(baseDesPoints[i].y > max)
        {
            max = baseDesPoints[i].y;
        }
    }
    return max;
}

function cmToPixel(val)
{
    return val * 37.795275591;
}


function getPointsPolygonAttributeValue(baseDesPoints)
{
    let point = baseDesPoints[0];
    let val = cmToPixel(point.x) + ',' + cmToPixel(point.y);
    for(let i=1; i<baseDesPoints.length; i++)
    {
        point = baseDesPoints[i];
        val = val + ' ' + cmToPixel(point.x) + ',' + cmToPixel(point.y);
    }
    return val;
}

/**
 * Cette fonction dessine un domaine considérè au préalable comme correcte
 * @param {*} baseDesPoints: l'ensemble des points définissant le domaine
 * @param {*} container: L'endroit (canvas) où on va déssiner le domaine
 * --/--> Faire attention au repère (X = width && Y = height)
 * --/--> Faire attention à l'unité de mesure (1cm = 37.795275591px)
 */
function tracerDomaine(baseDesPoints, container)
{
    /* on permet le scrolling de l'ecran */
    container.innerHTML = '';
    container.style.overflow = 'auto';
    container.style.height = '600px';
    container.style.marginTop = '10px';
    container.style.marginLeft = '10px'; 


    /* on definit la taille du SVG de sorte à ce qu'il puisse contenir le domaine entier*/
    let minWidth = cmToPixel(maxX(baseDesPoints)) + 100;
    let minHeight = cmToPixel(maxY(baseDesPoints)) + 100;

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if(minWidth > minHeight)
    {
        svg.setAttribute("width", minWidth + 'px');
        svg.setAttribute("height", minWidth + 'px');
    }else
    {
        svg.setAttribute("width", minHeight + 'px');
        svg.setAttribute("height", minHeight + 'px');
    }

    container.appendChild(svg);

    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

    polygon.setAttribute("points", getPointsPolygonAttributeValue(baseDesPoints));
    polygon.setAttribute("style", "fill:none;stroke:blue");
    svg.appendChild(polygon);
}


/** 
 * Fonction de création et d'affichage de domaine
 * --/--> Faire attention au niveau du maillage lorsque le domaine n'est pas discrétisable
 * --/--> Les valeurs négatives doivent être recalculées
 * @return true si le domaine est créé
*/
function createDomain()
{
    baseDesPoints = [];
    if(pointsCounter >= 3)
    {
        /* on recupère la définition de chaque point */
        for(let i=1; i <=pointsCounter; i++)
        {
            let coordonneesPoint = document.getElementById("point_"+i).getElementsByTagName("input");
            let counter = baseDesPoints.length;
            /* on ajoute le nouveau point dans la base des points */
            baseDesPoints[counter] = {
                "id": counter,
                "x": coordonneesPoint[0].value,
                "y": coordonneesPoint[1].value
            }             
        }

        if(!estCorrecteBaseDesPoints(baseDesPoints))
        {
            return false;
        }

        /* maintenant que nous avons l'ensemble des points on peut tracer le domaine */
        tracerDomaine(baseDesPoints, document.getElementById("ecran_domaine"));

        /* Si le nombre de point est égale à 3 alors c'est un triangle d'ou convexe */
        /* Sinon (> 3) il faut le vérifier */
        if(pointsCounter > 3)
        {
            if(!estConvexe(baseDesPoints))
            {
                return false;
            }
        }

    }else{
        return false;
    }

    return true;
    
}


function switchTo(from, to)
{
    from.style.display = 'none';
    to.style.display = 'block';

}


/**
 * 
 * @param {*} baseDesPoints 
 * @param {*} i point actuel
 * Cette fonction retourne le point à gauche du point i dans le domaine 
 */
function pointGauche(baseDesPoints, i)
{
    if(i<baseDesPoints.length && i>0)
    {
        return i-1;
    }else if(i==0)
    {
        return baseDesPoints.length - 1;
    }
    return -1;
}


/**
 * 
 * @param {*} baseDesPoints 
 * @param {*} i point actuel
 * Cette fonction retourne le point à droite du point i dans le domaine  
 */
function pointDroit(baseDesPoints, i)
{
    if(i<baseDesPoints.length -1 && i>-1)
    {
        return i+1;
    }else if(i == baseDesPoints.length -1)
    {
        return 0;
    }
    return -1;
}

/**
 * 
 * @param {*} baseDesPoints 
 * @param {*} i point actuel
 * Cette fonction retoune le triangle basé autour du point i dans le domaine 
 */
function getTriangleAutourDuPoint(baseDesPoints, i)
{
    let pg = pointGauche(baseDesPoints, i);
    let pd = pointDroit(baseDesPoints, i);
    if(pg == -1 || pd == -1)
    {
        return null;
    }

    let pointG = baseDesPoints[pg];
    let pointD = baseDesPoints[pd];
    let point = baseDesPoints[i];
    return [pointG, point, pointD];
}

/**
 * 
 * @param {*} triangle 
 * @param {*} i: position du point de réfèrence
 * Cette fonction retourne la droite opposée au point de réfèrence  
 */
function droiteOpposeeAuSommetDutriangle(triangle, i)
{
    let droite = [];
    let j=0;
    for(let k=0;k<3; k++)
    {
        if(k != i)
        {
            droite[j] = triangle[k];
            j++;
        } 
    }
    return droite;
}


/**
 * 
 * @param {*} droite
 * Cette fonction retourne l'équation de droite en objet {a:number, b:number} a et b representant y=ax+b  
 */
function equationDeDroite(droite)
{
    /* NB: les formules suivantes résultent d'une implémentation d'une methode de résolution de système linéaire
    par substitution */
    let p1 = droite[0];
    let p2 = droite[1];

    let b; 
    let a;
    
    if(p1.x == 0)
    {
        if(p2.x == 0)
        {
            if(p1.y == 0)
            {
                if(p2.y == 0)
                {
                    return null;
                }else
                {
                    /* cas l'axe des ordonnées */
                    return {"x":0};
                }
            }else
            {
                if(p2.y == 0)
                {
                    /* cas l'axe des ordonnées */
                    return {"x":0};
                }else
                {
                    /* cas l'axe des ordonnées */                             
                    return {"x":0};
                }

            }
           
        }else
        {
            if(p1.y == 0)
            {
                if(p2.y == 0)
                {
                    /* cas l'axe des abscisses */
                    return {"y":0};;
                }else
                {
                    b = 0;
                    a = p2.y/p2.x;
                }
            }else
            {
                if(p2.y == 0)
                {
                    b = p1.y;
                    a = (-b)/p2.x;
                }else
                {
                    b = p1.y;
                    a = (p2.y - b)/p2.x;
                }

            }
        }
    }else
    {
        if(p2.x == 0)
        {
            if(p1.y == 0)
            {
                if(p2.y == 0)
                {
                    /* cas l'axe des abscisses */
                    return {"y":0};
                }else
                {
                   b = p2.y;
                   a = (p1.y - b)/ p1.x; 
                }
            }else
            {
                if(p2.y == 0)
                {
                    b = 0;
                    a = p1.y/p1.x;
                }else
                {
                    b = p2.y;
                    a = (p1.y - p2.y)/p1.x;
                }

            }
           
        }else
        {
            if(p1.y == 0)
            {
                if(p2.y == 0)
                {
                    return {"y":0};;
                }else
                {
                    a = p2.y/(p2.x - p1.x);
                    b = (-a)*p1.x;
                }
            }else
            {
                if(p2.y == 0)
                {
                    a = p1.y/(p1.x - p2.x);
                    b = (-a)*p2.x;
                }else
                {
                    if(p1.x == p2.x)
                    {
                        return {"x":p1.x};
                    }else if(p1.y == p2.y)
                    {
                        return {"y":p1.y};
                    }else
                    {
                        b = ((p2.y) - (((p1.y) * (p2.x))/p1.x))/(1 - (p2.x/p1.x));
                        a = ((p1.y) - b)/p1.x; 
                    } 
                }

            }
        }
    }
    
    return {"a":a, "b":b};
}




/**
 * 
 * @param {*} droite 
 * Cette fonction vérifie si un point appartient à une droite ou non
 * --/--> Attention à l'égalité des chiffres à virgules
 */
function verifieEquationDeDroite(equationDroite, point)
{
    if(equationDeDroite.a != undefined)
    {
        /* On vérifie si y=ax+b */
        if(point.y == ((equationDeDroite.a * point.x) + equationDeDroite.b))
        {
            return true;
        }else
        {
            return false;
        }
    }else if(equationDeDroite.x != undefined)
    {
        /* On vérifie si x=a */
        if(point.x == equationDeDroite.x)
        {
            return true;
        }else
        {
            return false;
        }
    }else if(equationDeDroite.y != undefined)
    {
        /* On vérifie si y=b */
        if(point.y == equationDeDroite.y)
        {
            return true;
        }else
        {
            return false;
        }
    }
    return false;
}



/**
 * 
 * @param {*} equation1: equation droite 1 
 * @param {*} equation2: equation droite 2 
 * Cette fonction retourne le point d'intersection de deux droites en résolvant un système d'équation
 */
function intersectionDeDeuxDroites(equation1, equation2)
{
    let x,y;
    if(equation1.a != undefined)
    {
        if(equation2.a != undefined)
        {
            if((equation1.a - equation2.a) !=0)
            {
                x = (equation2.b - equation1.b)/(equation1.a - equation2.a);
                y = (equation1.a * x) + equation1.b;
                return {"x":x, "y":y};
            }else
            {
                if(equation1.a == equation2.a)
                {
                    if(equation1.b == equation2.b)
                    {
                        return {"x":Number.POSITIVE_INFINITY, "y":Number.POSITIVE_INFINITY};
                    }else
                    {
                        return null;
                    }

                }else if(equation1.a == 0 && equation2.a ==0)
                {
                    if(equation1.b == equation2.b)
                    {
                        return {"x":Number.POSITIVE_INFINITY, "y":Number.POSITIVE_INFINITY};
                    }else
                    {
                        return null;
                    }
                }
            }
            return null;

        }else if(equation2.x != undefined)
        {
            x = equation2.x;
            y = (equation1.a * x) + equation1.b;
            return {"x":x, "y":y}; 
        }else if (equation2.y != undefined && equation1.a != 0)
        {
            y = equation2.y;
            x = (y - equation1.b)/equation1.a;
            return {"x":x, "y":y};
        }else
        {
            return null;
        }
    }else if(equation1.x != undefined)
    {
        if(equation2.a != undefined)
        {
            x = equation1.x;
            y = (equation2.a * x) + equation2.b;
            return {"x":x, "y":y}; 
        }else if (equation2.x != undefined)
        {
            if(equation2.x == equation1.x)
            {
                return {"x":Number.POSITIVE_INFINITY, "y":Number.POSITIVE_INFINITY};
            }else
            {
                return null;
            }
        }
        else if (equation2.y != undefined)
        {
            y = equation2.y;
            x = equation1.x;
            return {"x":x, "y":y};
        }else
        {
            return null;
        }

    }else if(equation1.y != undefined)
    {
        if(equation2.a != undefined && equation2.a != 0)
        {
            y = equation1.y;
            x = (y - equation2.b)/equation2.a;
            return {"x":x, "y":y};
        }else if (equation2.x != undefined)
        {
            y = equation1.y;
            x = equation2.x;
            return {"x":x, "y":y};
        }
        else if (equation2.y != undefined)
        {
            if(equation2.y == equation1.y)
            {
                return {"x":Number.POSITIVE_INFINITY, "y":Number.POSITIVE_INFINITY};
            }else
            {
                return null;
            }
        }else
        {
            return null;
        }

    }
    return null;
}


/**
 * 
 * @param {*} droite 
 * @param {*} equation 
 * @param {*} point 
 * Cette fonction determine si un point appartient à un segment délimité par les points de la droite.
 * NB: On suppose au préalable que le point appartient déjà à la droite
 */
function estDansLeSegmentDeDroite(droite, equation, point)
{
    let point1 = droite[0];
    let point2 = droite[1];

    /* Il y a trois types d'équation y=ax + b ({"a":a,"b":b}) , y=a ({"y":a}), x=b ({"x":b}) */

    if(equation.a != undefined || equation.y !=undefined)
    {
        if(point1.x < point2.x)
        {
            if(point.x < point1.x || point.x >point2.x)
            {
                return false;
            }
        }else
        {
            if(point.x < point2.x || point.x >point1.x)
            {
                return false;
            }
        }

    }else if(equation.x != undefined)
    {
        if(point1.y < point2.y)
        {
            if(point.y < point1.y || point.y >point2.y)
            {
                return false;
            }
        }else
        {
            if(point.y < point2.y || point.y >point1.y)
            {
                return false;
            }
        }        
    }
    return true;
}



/**
 * 
 * @param {*} baseDesPoints
 * Vérifie si un domaine est apte à être mailler cad s'il est convexe ou non 
 */
function estConvexe(baseDesPoints)
{
    for(let i=0; i<baseDesPoints.length; i++)
    {
        let triangle1 = getTriangleAutourDuPoint(baseDesPoints, i);
        let triangle2 = getTriangleAutourDuPoint(baseDesPoints, pointDroit(baseDesPoints, i));

        if(triangle1 == null || triangle2 == null)
        {
            return false;
        }

        let droite1 = droiteOpposeeAuSommetDutriangle(triangle1, 1);
        let droite2 = droiteOpposeeAuSommetDutriangle(triangle2, 1);
  

        let equation1 = equationDeDroite(droite1);
        let equation2 = equationDeDroite(droite2);

        if(equation1 == null || equation2 == null)
        {
            return false;
        }

        let intersection = intersectionDeDeuxDroites(equation1, equation2);

        /* le point d'intersection doit être entre les segments délimités par les points de la droite1 
        et de la droite2 (c'est point caractéristique de deux angles successifs convexes)*/
        if(intersection == null)
        {
            return false;
        }else if(intersection.x != Number.POSITIVE_INFINITY)
        {
            if(equation1.a != undefined || equation1.y != undefined)
            {
                if(equation2.a != undefined || equation2.y != undefined)
                {
                    if(!estDansLeSegmentDeDroite(droite1, equation1, intersection))
                    {
                        return false;
                    }
                    if(!estDansLeSegmentDeDroite(droite2, equation2, intersection))
                    {
                        return false;
                    }

                }else if (equation2.x != undefined)
                {
                    if(!estDansLeSegmentDeDroite(droite1, equation1, intersection))
                    {
                        return false;
                    }
                    if(!estDansLeSegmentDeDroite(droite2, equation2, intersection))
                    {
                        return false;
                    }
                }
            }else if (equation1.x != undefined)
            {
                if(equation2.a != undefined || equation2.y != undefined)
                {
                    if(!estDansLeSegmentDeDroite(droite1, equation1, intersection))
                    {
                        return false;
                    }
                    if(!estDansLeSegmentDeDroite(droite2, equation2, intersection))
                    {
                        return false;
                    }
                }else if (equation2.x != undefined)
                {
                    if(!estDansLeSegmentDeDroite(droite1, equation1, intersection))
                    {
                        return false;
                    }
                    if(!estDansLeSegmentDeDroite(droite2, equation2, intersection))
                    {
                        return false;
                    }

                }

            }
        }
    }
    return true;
}


/**
 * 
 * @param {*} baseDesTrianglesFinis 
 * @param {*} baseDesTrianglesInfinis 
 * @param {*} container
 * Cette fonction dessine les triangles 
 */
function dessiner(baseDesPoints, baseDesTrianglesFinis, baseDesTrianglesInfinis, container)
{
    container.innerHTML = "";  
    container.style.overflow = 'auto';
    container.style.height = '600px';
    container.style.marginTop = '10px';
    container.style.marginLeft = '10px';  

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "svg_image";

    let x = cmToPixel( (baseDesPoints.length != 0)? maxX(baseDesPoints) : 20) + 100;
    let y = cmToPixel( (baseDesPoints.length != 0)? maxY(baseDesPoints) : 20) + 100;

    if(x>y)
    {
        svg.style.width = x + 'px';
        svg.style.height = x + 'px';
    }else
    {
        svg.style.width = y + 'px';
        svg.style.height = y + 'px';
    }

    container.appendChild(svg);


    for(let i=0; i<baseDesTrianglesFinis.length; i++)
    {
        let triangle = baseDesTrianglesFinis[i];
        let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", getPointsPolygonAttributeValue(triangle));
        polygon.setAttribute("style", "fill:none;stroke:blue");
        svg.appendChild(polygon);
    }
    for(let i=0; i<baseDesTrianglesInfinis.length; i++)
    {
        let triangle = baseDesTrianglesInfinis[i];
        let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

        polygon.setAttribute("points", getPointsPolygonAttributeValue(triangle));
        polygon.setAttribute("style", "fill:none;stroke:blue");
        svg.appendChild(polygon);
    }
    
}

/**
 * 
 * @param {*} estCorrecteDomaine 
 * Cette fonction lance le maillage
 */
function lancerMaillage(estCorrecteDomaine)
{
    estMaille = false;
    if(estCorrecteDomaine)
    {
        /* Si le pas est supérieur au premier niveau de maillage, la solution est ce dernier résultat */
        /* Sinon, il faudra mailler à niveau suprérieur */
        let pas = Number(document.getElementById("pas").value);

        if(!isNaN(pas))
        {
            triangularisation(baseDesPoints, pas);
            maillage(baseDesTrianglesFinis, baseDesTrianglesInfinis, pas);
            if(baseDesTrianglesInfinis.length == 0)
            {   
                alert("Le maillage semble avoir réussi! Bravo!");
                estMaille = true;
            }
            dessiner(baseDesPoints, baseDesTrianglesFinis, baseDesTrianglesInfinis, document.getElementById("ecran_domaine"));
        }else
        {
            alert("Votre pas n'est pas correcte.");
        }
        
    }else
    {
        alert("Votre domaine est incorrecte. Veuillez le vérifier!");
        return false;
    }
    return true;
}


/**
 * 
 * @param {*} droite 
 * Cette fonction retourne la distance de la droite
 */
function distanceDroite(droite)
{
    let point1 = droite[0];
    let point2 = droite[1];

    return Math.sqrt(((point1.x - point2.x) * (point1.x - point2.x)) + ((point1.y - point2.y) * (point1.y - point2.y)));
}

/**
 * 
 * @param {*} triangle 
 * @param {*} pas 
 * Cette fonction vérifie que le triangle respecte le pas.
 */
function respecteLePas(triangle, pas)
{
    let droite;
    for(let i=0; i<3; i++)
    {
        droite = droiteOpposeeAuSommetDutriangle(triangle, i);
        if(distanceDroite(droite) > pas)
        {
            return false;
        }

    }
    return true;
}


/**
 * 
 * @param {*} triangle
 * Cette fonction vérifie si les trois points appartiennent à la même droite.
 * Ce qui est mathématiquement faut pour un triangle mais peut survenir dans le programme. 
 */
function triangleEstUneDroite(triangle)
{
    let droite = droiteOpposeeAuSommetDutriangle(triangle, 1);
    let equation = equationDeDroite(droite);
    return verifieEquationDeDroite(equation, triangle[1]);
}


/**
 * 
 * @param {*} baseDesPoints
 * Cette fonction triangularise le domaine qui au préalable est jugé correcte
 */
function triangularisation(baseDesPoints, pas)
{
    baseDesTrianglesFinis = [];
    baseDesTrianglesInfinis = [];

    let triangle = [baseDesPoints[0], baseDesPoints[1], baseDesPoints[2]];


    if(respecteLePas(triangle, pas))
    {
        baseDesTrianglesFinis[baseDesTrianglesFinis.length] = triangle;
    }else
    {
        baseDesTrianglesInfinis[baseDesTrianglesInfinis.length] = triangle;
    }
    let newPoint;
    for(let i=3; i<baseDesPoints.length; i++)
    {
        newPoint = baseDesPoints[i];
        /*On récupère le côté opposé à ce dernier point et provenant du triangle précédent*/
        let droite = droiteOpposeeAuSommetDutriangle(triangle, 1);
        /* puis on forme un triangle avec la droite et ce nouveau point */
        triangle = [droite[0], droite[1], newPoint];
        if(respecteLePas(triangle, pas) || triangleEstUneDroite(triangle))
        {
            baseDesTrianglesFinis[baseDesTrianglesFinis.length] = triangle;
        }else
        {
            baseDesTrianglesInfinis[baseDesTrianglesInfinis.length] = triangle;
        }
    }
}

/**
 * 
 * @param {*} triangle 
 * Cette fontion retourne la plus grande arrête
 */
function plusGrandeArrete(triangle)
{
    let droiteMax = droiteOpposeeAuSommetDutriangle(triangle, 0);
    for(let i=1; i<3; i++)
    {
        let droiteActuel = droiteOpposeeAuSommetDutriangle(triangle, i);
        if(distanceDroite(droiteActuel) > distanceDroite(droiteMax))
        {
            droiteMax = droiteActuel;
        }
    }
    return droiteMax;
}

/**
 * 
 * @param {*} triangle 
 * @param {*} arrete
 * Cette fonction teste si une arrête se trouve dans le triangle 
 */
function arreteEstDansTriangle(triangle, arrete)
{
    /*Pour se faire on vérifie si les points de l'arrête se trouvent dans le triangle */
    for(let i = 0; i<arrete.length; i++)
    {
        let estDans = false;
        for(let j=0; j<triangle.length; j++)
        {
            if(arrete[i].x == triangle[j].x && arrete[i].y == triangle[j].y)
            {
                estDans = true;
            }
        }
        if(!estDans)
        {
            return false;
        }
    }
    return true;
}


/**
 * 
 * @param {*} baseDesTrianglesInfinis 
 * @param {*} arrete 
 * Cette fonction retourne le triangle partageant la même arrête
 */
function triangleContenantArrete(baseDesTrianglesInfinis, arrete)
{
    for(let i=0; i<baseDesTrianglesInfinis.length; i++)
    {
        let triangle = baseDesTrianglesInfinis[i];
        if(arreteEstDansTriangle(triangle, arrete))
        {
            /* retour et suppression de la base*/
            return baseDesTrianglesInfinis.splice(i,1)[0];
        }
    }
    return null;
}

/**
 * 
 * @param {*} arrete
 * Cette fonction renvoie le mileu de l'arrête 
 */
function milieuArrete(arrete)
{
    return {"x": (arrete[0].x + arrete[1].x)/2, "y": (arrete[0].y + arrete[1].y)/2};
}

/**
 * 
 * @param {*} triangle 
 * @param {*} arrete
 * Cette fonction retourne le point opposé à l'arrête 
 * NB: On suppose au préalable que l'arrête fait partie du triangle
 */
function pointOpposeArrete(triangle, arrete)
{
    for(let i=0; i<triangle.length; i++)
    {
        let estDans = false;
        for(let j=0; j<arrete.length; j++)
        {
            if(triangle[i].x == arrete[j].x && triangle[i].y == arrete[j].y)
            {
                estDans = true;
            }
        }
        if(!estDans)
        {
            return triangle[i];
        }
    }
    return null;
}

/**
 * 
 * @param {*} baseDesTrianglesFinis 
 * @param {*} baseDesTrianglesInfinis 
 * @param {*} pas
 * 
 * Cette fonction réalise le maillage des triangles 
 */
function maillage(baseDesTrianglesFinis, baseDesTrianglesInfinis, pas)
{
    while(baseDesTrianglesInfinis.length > 0)
    {
        let triangle = baseDesTrianglesInfinis.shift();
        let arreteLaPlusLongue = plusGrandeArrete(triangle);
        let milieu = milieuArrete(arreteLaPlusLongue);
        let pointOppose = pointOpposeArrete(triangle, arreteLaPlusLongue);

        let trianglesFils = [];

        /*On crée deux nouveaux triangles fils à partir de ce dernier triangle */
        trianglesFils[0] = [pointOppose, milieu, arreteLaPlusLongue[0]];
        trianglesFils[1] = [pointOppose, milieu, arreteLaPlusLongue[1]];

        /* On chercher s'il existe un triangle voisin partageant la même longue arrête du triangle père*/
        let triangleVoisin = triangleContenantArrete(baseDesTrianglesInfinis, arreteLaPlusLongue);
        if(triangleVoisin != null)
        {
            let pointOpposeVoisin = pointOpposeArrete(triangleVoisin, arreteLaPlusLongue);
         
            /* On crée deux nouveau fils à partir du triangle voisin */
            trianglesFils[2] = [pointOpposeVoisin, milieu, arreteLaPlusLongue[0]];
            trianglesFils[3] = [pointOpposeVoisin, milieu, arreteLaPlusLongue[1]];
        }

        /*En fonction de la finalité ou non des triangles fils, on les insère dans les bases */
        for(let i=0; i<trianglesFils.length; i++)
        {
            if(respecteLePas(trianglesFils[i], pas))
            {
                baseDesTrianglesFinis.push(trianglesFils[i]);
            }else
            {
                baseDesTrianglesInfinis.push(trianglesFils[i]);
            }
        }
    }
}


