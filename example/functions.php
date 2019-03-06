<?php
function destroy($source_img, $destination_img){
    unlink($source_img);
    unlink($destination_img);
}

function getGUID(){
    if (function_exists('com_create_guid')) {
        return com_create_guid();
    } else {
        mt_srand((double) microtime() * 10000); //optional for php 4.2.0 and up.
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45); // "-"
        $uuid   = chr(123) // "{"
            . substr($charid, 0, 8) . $hyphen . substr($charid, 8, 4) . $hyphen . substr($charid, 12, 4) . $hyphen . substr($charid, 16, 4) . $hyphen . substr($charid, 20, 12) . chr(125); // "}"
        return $uuid;
    }
}

function errorOut($type){
    
    switch ($type) {
        case "image":
            $responseArray = array(
                'command' => 'Bad Request: Missing paramater image'
            );
            break;
        case "type":
            $responseArray = array(
                'command' => 'Bad Request: Unsupported data type'
            );
            break;
        default:
            $responseArray = array(
                'command' => 'Bad Request'
            );
            break;
    }
    
    http_response_code(400);
    $encoded = json_encode($responseArray);
    header('Content-Type: application/json');
    echo $encoded;
    exit();
}

function png($source, $destination, $qt = 9){
    
    list($uploadWidth, $uploadHeight, $uploadType) = getimagesize($source);
    
    $srcImage = imagecreatefrompng($source);
    
    $targetImage = imagecreatetruecolor($uploadWidth, $uploadHeight);
    imagealphablending($targetImage, false);
    imagesavealpha($targetImage, true);
    
    imagecopyresampled($targetImage, $srcImage, 0, 0, 0, 0, $uploadWidth, $uploadHeight, $uploadWidth, $uploadHeight);
    
    imagepng($targetImage, $destination, $qt);
    
    $compressed = base64_encode(file_get_contents($destination));
    return $compressed;
}

function jpg($source, $destination, $qt = 30){
    
    $image = imagecreatefromjpeg($source);
    
    imagejpeg($image, $destination, $qt);
    
    $compressed = base64_encode(file_get_contents($destination));
    return $compressed;
}

function gif($source, $destination){
    $img = imagecreatefromgif($source);
    imagetruecolortopalette($img, false, 16); 
    imagegif($img, $destination);
    $compressed = base64_encode(file_get_contents($destination));
    return $compressed;
}
?>
