<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

require 'Slim/Slim.php';

$app = new Slim();

$app->get('/', 'missing');
$app->get('/pin/:id', 'getPin');
$app->post('/pin', 'setPin');
//start redis connection
global $redis;
$redis = new Redis();
$redis->connect('127.0.0.1');
//run slim app
$app->run();
//close redis
$redis->close();

function missing() {
	echo 'This is not a real path';
}

function getPin($id) {
	global $redis;
	$location = $redis->get($id);
	if ($location) {
		echo json_encode(array("location" => $location));
	} else {
		echo json_encode(array("message" => array(
			"title" => "Uh Oh...",
			"message" => "This location has expired and your friends left without you.")));
	}
}

function setPin() {
	global $redis;
	//generate unique key
	$key = getUniqueKey();
	//post new value
	$request = json_decode(Slim::getInstance()->request()->getBody());
	if ($redis->setex(
			$key,
			$request->ttl,
			$request->location)) {
		echo json_encode(array("key" => $key));	
	} else {
		echo json_encode(array("message" => array(
			"title" => "Uh Oh...",
			"message" => "Could not generate a key.")));
	}
}

function getUniqueKey() {
	global $redis;
	$dictionary = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890";
	$key = "";
	while(!$key) {
		$length = 5;
		while($length) {
			$key .= $dictionary[rand(0, strlen($dictionary) - 1)];
			$length--;
		}
		if ($redis->exists($key)) $key = "";
	}
	return $key;
}
