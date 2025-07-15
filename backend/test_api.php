<?php

// Test API endpoints directly
$baseUrl = 'http://localhost:8001/api';

// Test 1: Register a user
$userData = [
    'name' => 'Test User',
    'email' => 'test' . time() . '@example.com',
    'password' => 'password123',
    'password_confirmation' => 'password123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/auth/register');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($userData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Registration Response (HTTP $httpCode):\n";
echo $response . "\n\n";

$result = json_decode($response, true);
if ($result && isset($result['token'])) {
    $token = $result['token'];
    $userId = $result['user']['id'];
    
    // Test 2: Create a workspace
    $workspaceData = [
        'name' => 'Test Workspace',
        'description' => 'Test workspace for API testing'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/workspaces');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($workspaceData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Workspace Creation Response (HTTP $httpCode):\n";
    echo $response . "\n\n";
    
    $workspaceResult = json_decode($response, true);
    if ($workspaceResult && isset($workspaceResult['workspace'])) {
        $workspaceId = $workspaceResult['workspace']['id'];
        
        // Test 3: Test setup progress endpoint
        $progressData = [
            'step' => 1,
            'data' => ['test' => 'data']
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . "/workspaces/$workspaceId/setup-progress");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($progressData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $token
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "Setup Progress Response (HTTP $httpCode):\n";
        echo $response . "\n\n";
    }
}
