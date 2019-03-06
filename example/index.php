<?php
require('functions.php');

$tmp = $_FILES['image']['tmp_name'];

if (!$tmp)
    errorOut("image");

if (isset($_POST['format']))
    $format = $_POST['format'];
else
    errorOut("type");

$uid             = getGUID();
$source_img      = "compress" . $uid . "." . $format;
$destination_img = "destination" . $uid . "." . $format;

$move = move_uploaded_file($tmp, $source_img);

if ($move === FALSE)
    errorOut(null);

$qt = 90;

if (isset($_GET['qt']))
    $qt = $_GET['qt'];


switch ($format) {
    case "jpeg":
    case "jpg":
        $mime  = "data:image/jpeg;base64,";
        $image = jpg($source_img, $destination_img, $qt);
        break;
    case "png":
        $mime = "data:image/png;base64,";
        
        if ($qt > 10)
            $qt %= 10;
        
        $image = png($source_img, $destination_img, 9);
        break;
    case "gif":
        $mime  = "data:image/gif;base64,";
        $image = gif($source_img, $destination_img);
        break;
    default:
        errorOut(null);
        break;
}

if ($image)
    echo json_encode(array('image' => $mime . $image));
else
    errorOut(null);

destroy($source_img, $destination_img);

?>