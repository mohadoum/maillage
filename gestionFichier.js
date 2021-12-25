/**
 * 
 * @param {*} baseDesTrianglesFinis
 * Cette fonction a pour rôle d'enregistrer un maillage dans un fichier
 */
function persist(baseDesTrianglesFinis)
{
    let fileName = document.getElementById("file_name").value;

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        if(this.responseText == "ok")
        {
            alert("le fichier de maillage a été crée\n" + "Veuillez le télécharger ici: " + "http://localhost/Maillage/server.php?file=" 
            + fileName + ".txt");
        }else
        {
            alert("Il semble y avoir un problème de sauvegarde!\n"+ "Message: " +this.responseText);
        }
      }
    };
    xhttp.open("POST", "server.php");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.send("type=save&base="+JSON.stringify(baseDesTrianglesFinis)+"&name="+fileName);
}


function load()
{
  let fileInput = document.getElementById("load_file_input");
  let files = fileInput.files;

  /* FormData allows us to define key/value pairs representing inputs and their values.*/
  /* With FormData, the encoding type is already set to multipart/form-data */ 

  let formData = new FormData();
  formData.append("load_file_input", files[0], files[0].name);

  /* Faisons une requête POST ajax afin de pouvoir lire le contenu du fichier */
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function()
  {
    if (this.readyState == 4 && this.status == 200) {
      let response = (isJsonText(this.responseText))?JSON.parse(this.responseText):this.responseText;
      if(Array.isArray(response) && response.length > 0)
      {
          alert("La lecture du fichier a réussi! Le maillage va être afficher.");
          dessiner([], response, [], document.getElementById("ecran_domaine"));
          show('zoom');

      }else
      {
          alert("Il semble y avoir un problème de lecture ou d'interpretation du contenu du fichier!\n"+ "Message: " +this.responseText);
      }
    }
  }
  xhttp.open("POST", "server.php");
  xhttp.send(formData);
}

function isJsonText(text)
{
  try{
      JSON.parse(text);
  }catch(e)
  {
      return false;
  }
  return true;
}