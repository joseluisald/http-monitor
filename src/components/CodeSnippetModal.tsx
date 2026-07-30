import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2 } from 'lucide-react';

interface CodeSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export function CodeSnippetModal({ isOpen, onClose, token = 'SUA_CHAVE_TOKEN_AQUI' }: CodeSnippetModalProps) {
  const [activeTab, setActiveTab] = useState<'laravel' | 'symfony' | 'guzzle' | 'php' | 'curl'>('laravel');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const snippets = {
    laravel: `<?php
namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;

class HttpMonitorMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        $response = $next($request);
        $duration = (int) ((microtime(true) - $startTime) * 1000);

        try {
            Http::withToken('${token}')
                ->timeout(2)
                ->async()
                ->post('${appUrl}/api/http', [
                    'method' => $request->method(),
                    'url' => $request->fullUrl(),
                    'host' => $request->getHost(),
                    'path' => $request->path(),
                    'status' => $response->getStatusCode(),
                    'duration' => $duration,
                    'memory_usage' => memory_get_usage(),
                    'peak_memory' => memory_get_peak_usage(),
                    'remote_ip' => $request->ip(),
                    'user_agent' => $request->userAgent() ?? 'PHP/8.3 Laravel',
                    'origin' => $request->ajax() ? 'AJAX' : (app()->runningInConsole() ? 'CLI' : 'WEB'),
                    'usuario_logado' => optional(auth()->user())->email,
                    'request_body' => $request->except(['password', 'credit_card']),
                    'response_body' => json_decode($response->getContent(), true) ?? [],
                ]);
        } catch (\\Throwable $e) {
            // Silently swallow monitoring failures
        }

        return $response;
    }
}`,

    symfony: `<?php
use Symfony\\Component\\HttpClient\\HttpClient;

class HttpLogger
{
    private static string $monitorUrl = '${appUrl}/api/http';
    private static string $bearerToken = '${token}';

    public static function log(
        string $method,
        string $url,
        int $statusCode,
        float $durationMs,
        mixed $requestData = null,
        mixed $responseData = null,
        ?string $exceptionMessage = null
    ): void {
        try {
            $client = HttpClient::create();
            $parsedUrl = parse_url($url);

            $client->request('POST', self::$monitorUrl, [
                'auth_bearer' => self::$bearerToken,
                'headers' => ['Content-Type' => 'application/json'],
                'json' => [
                    'method'          => strtoupper($method),
                    'url'             => $url,
                    'host'            => $parsedUrl['host'] ?? $_SERVER['HTTP_HOST'] ?? 'localhost',
                    'path'            => $parsedUrl['path'] ?? '/',
                    'status'          => $statusCode,
                    'duration'        => round($durationMs, 2),
                    'memory_usage'    => memory_get_usage(),
                    'peak_memory'     => memory_get_peak_usage(),
                    'remote_ip'       => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                    'origin'          => php_sapi_name() === 'cli' ? 'CLI' : 'WEB',
                    'request_body'    => $requestData,
                    'response_body'   => $responseData,
                    'exception'       => $exceptionMessage,
                ],
                'timeout' => 2.0,
            ]);
        } catch (\\Throwable $e) {
            // Silenciosamente ignora falhas
        }
    }
}`,

    guzzle: `use GuzzleHttp\\Client;

$client = new Client([
    'base_uri' => '${appUrl}',
    'headers' => [
        'Authorization' => 'Bearer ${token}',
        'Content-Type' => 'application/json',
    ]
]);

$client->postAsync('/api/http', [
    'json' => [
        'method' => 'POST',
        'url' => 'https://sua-api.com.br/v1/pedidos',
        'status' => 200,
        'duration' => 85,
        'origin' => 'WEB',
        'usuario_logado' => 'carlos@empresa.com.br'
    ]
]);`,

    php: `<?php
// Exemplo PHP Nativo (Vanilla cURL)
$data = [
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'GET',
    'url' => (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]",
    'status' => http_response_code() ?: 200,
    'duration' => 120,
    'memory_usage' => memory_get_usage(),
    'remote_ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    'origin' => 'WEB',
];

$ch = curl_init('${appUrl}/api/http');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ${token}'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_exec($ch);
curl_close($ch);
`,

    curl: `curl -X POST "${appUrl}/api/http" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "POST",
    "url": "https://api.empresa.com.br/v1/vendas/checkout",
    "status": 200,
    "duration": 185,
    "memory_usage": 12582912,
    "origin": "AJAX",
    "usuario_logado": "cliente@email.com",
    "request_body": { "produto_id": 482, "qtd": 1 }
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Guia de Integração do Cliente PHP</h3>
              <p className="text-xs text-slate-500">Copie o código para enviar telemetria HTTP para o monitor</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'laravel', label: 'Laravel Middleware' },
              { id: 'symfony', label: 'Symfony HttpClient' },
              { id: 'guzzle', label: 'Guzzle HTTP' },
              { id: 'php', label: 'PHP Native (cURL)' },
              { id: 'curl', label: 'cURL Terminal' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow transition-all mb-2"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Snippet</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 bg-slate-950">
          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto max-h-96 leading-relaxed">
            {snippets[activeTab]}
          </pre>
        </div>
      </div>
    </div>
  );
}
