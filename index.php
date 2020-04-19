<?php
if ($_SERVER['HTTPS'] == "on") {
    $location = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header('HTTP/1.1 301 Moved Permanently');
    header('Location: ' . $location);
    exit;
}

header("Location: web/");
exit();
?>