<?php

function save()
{
    $baseDesTriangles = json_decode($_REQUEST['base']);
    $fileName = $_REQUEST['name'].'.txt';

    if(!file_exists($fileName))
    {
        $file = fopen($fileName, "w") or die("Unable to open file!");
        $compteurTriangles = count($baseDesTriangles);
        for($i=0; $i<$compteurTriangles; $i++)
        {
            $input = "";
            $compteurPoints = count($baseDesTriangles[$i]);
            for($j=0; $j< $compteurPoints; $j++)
            {
                $triangle = $baseDesTriangles[$i];
                $input = $input . $triangle[$j]->x . ":" . $triangle[$j]->y;  
                if($j != ($compteurPoints - 1))
                {
                    $input = $input . "-";
                }
            } 

            if($i != ($compteurTriangles -1))
            {
                $input = $input . ";";
            }

            fwrite($file, $input);
        }

        fclose($file);

        return "ok"; 
    }else
    {
        return "This name of file already exists!";
    } 
}


function download($file)
{  
    header("Content-Description: File Transfer"); 
    header("Content-Type: application/octet-stream"); 
    header("Content-Disposition: attachment; filename=" . basename($file)); 

    readfile ($file);
}

function definirBaseDesTriangles($fileContent)
{
    $base = [];
    $triangles = explode(';', $fileContent);
    if($triangles != null)
    {
        for($i=0; $i<count($triangles); $i++)
        {
           $points = explode('-', $triangles[$i]);
           if($points != null && count($points) == 3)
           {
                $base[$i] = [];
                for($j=0; $j<3; $j++)
                {
                    $coordonnees = explode(':', $points[$j]);
                    if($coordonnees != null && count($coordonnees) == 2)
                    {
                        $base[$i][$j] = (object)array("x" => $coordonnees[0], "y" => $coordonnees[1]);        
                    }else
                    {
                        return null;
                    }
                }
           }else
           {
               return null;
           }
        }
    }else
    {
        return null;
    }
    return $base;
}

function isExtension($fileName, $ext)
{
    $pos = strripos($fileName, '.'.$ext);
    /* On teste s'il existe et est le dernier */
    if($pos > -1 && $pos == (strlen($fileName) - strlen('.'.$ext)))
    {
        return true;
    }
    return false;
}

/* sauvegarde de fichier de maillage */
if(isset($_GET['file']))
{
    if(file_exists($_GET['file']) && isExtension($_GET['file'], 'txt'))
    {
        download($_GET['file']);
        /* after we can delete file */
        unlink($_GET['file']);
    }else
    {
        echo "<h1>Sorry, this file deosn't exist!</h1>";
    }
    
} /* lecture de fichier de maillage */
elseif(isset($_FILES['load_file_input']['name']))
{
    /* On récupère son contenu */
    $contents = file_get_contents($_FILES['load_file_input']['tmp_name']);
    $base = definirBaseDesTriangles($contents);
    if($base != null)
    {
        echo json_encode($base);
    }else
    {
        echo "Votre fichier n'a un contenu bien formé.";
    }

    
}
else
{
    if($_REQUEST['type'] == "save")
    {
        echo save();
    }else
    {
        echo "Fonction server indisponible!";
    }
}




?>