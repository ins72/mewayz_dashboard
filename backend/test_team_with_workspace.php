<?php

// Test Team Management endpoints with workspace parameter
$baseUrl = 'http://localhost:8001/api';

// First, register a user and get token
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

$result = json_decode($response, true);
if ($result && isset($result['token'])) {
    $token = $result['token'];
    
    // Create a workspace first
    $workspaceData = [
        'name' => 'Test Workspace',
        'description' => 'Test workspace for team testing'
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
    
    $workspaceResult = json_decode($response, true);
    if ($workspaceResult && isset($workspaceResult['workspace'])) {
        $workspaceId = $workspaceResult['workspace']['id'];
        
        // Test team dashboard endpoint with workspace_id
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . '/team/dashboard?workspace_id=' . $workspaceId);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $token
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "Team Dashboard Response (HTTP $httpCode):\n";
        echo $response . "\n\n";
        
        // Test team members endpoint with workspace_id
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $baseUrl . '/team/members?workspace_id=' . $workspaceId);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . $token
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "Team Members Response (HTTP $httpCode):\n";
        echo $response . "\n\n";
    }
}
