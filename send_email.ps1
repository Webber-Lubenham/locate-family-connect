# Configuração do email
$From = "educatechov@gmail.com"
$To = "frank.webber.dev@gmail.com"
$Subject = "Importante: Migrações de Banco de Dados para o Locate Family Connect"
$Body = @"
Olá Webber,

Estamos implementando o relacionamento bidirecional entre responsáveis e estudantes no Locate Family Connect e precisamos aplicar algumas migrações SQL no banco de dados Supabase.

Por favor, verifique o arquivo MIGRATIONS.md no repositório do projeto para instruções detalhadas sobre como executar as migrações necessárias.

Arquivos principais a executar:
1. supabase/migrations/20250426_fix_guardian_relationships.sql
2. supabase/migrations/20250427_add_guardian_functions.sql

Isso é essencial para o funcionamento correto das novas funcionalidades que estamos implementando, incluindo:
- Pais adicionarem estudantes
- Estudantes adicionarem responsáveis
- Visualização correta de relações em ambos os dashboards

Para qualquer dúvida, estou à disposição.

Atenciosamente,
Frank Webber (Frontend)
"@

# Configuração do servidor SMTP
$SMTPServer = "smtp.gmail.com"
$SMTPPort = 587
$Username = "educatechov@gmail.com"
$Password = Read-Host "Digite a senha do e-mail educatechov@gmail.com" -AsSecureString

# Criação da mensagem
$message = New-Object System.Net.Mail.MailMessage
$message.From = $From
$message.To.Add($To)
$message.Subject = $Subject
$message.Body = $Body

# Configuração do cliente SMTP
$client = New-Object System.Net.Mail.SmtpClient($SMTPServer, $SMTPPort)
$client.EnableSsl = $true
$client.Credentials = New-Object System.Net.NetworkCredential($Username, $Password)

try {
    # Envio do e-mail
    Write-Host "Enviando e-mail para $To..."
    $client.Send($message)
    Write-Host "E-mail enviado com sucesso!"
} catch {
    Write-Host "Erro ao enviar e-mail: $_"
} finally {
    # Liberação de recursos
    $client.Dispose()
    $message.Dispose()
}
