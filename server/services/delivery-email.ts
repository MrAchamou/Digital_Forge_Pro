import { Resend } from 'resend';
import { log } from '../vite';
import type { DeliveryEmailContent } from './cerebras-content-generator';

function buildEmailHtml(params: {
  content: DeliveryEmailContent;
  clientName: string;
  signatureId: string;
  previewUrl: string;
  downloadUrl: string;
  accent: string;
}): string {
  const { content, clientName, signatureId, previewUrl, downloadUrl, accent } = params;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${content.sujet}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;padding:40px 20px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,${accent}22,${accent}08);border:1px solid ${accent}22;border-radius:16px 16px 0 0;padding:32px 40px 24px;text-align:center;">
            <p style="color:${accent};font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">EffectForge AI</p>
            <h1 style="color:#ffffff;font-size:26px;font-weight:400;margin:0;line-height:1.3;">${content.sujet}</h1>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background:#111827;border-left:1px solid ${accent}22;border-right:1px solid ${accent}22;padding:32px 40px;">
            <p style="color:#e8e8ff;font-size:16px;line-height:1.7;margin:0 0 20px;">${content.intro}</p>
            <p style="color:rgba(232,232,255,0.7);font-size:14px;line-height:1.7;margin:0 0 24px;">${content.corps}</p>

            <!-- MAGIC SECTION -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${accent}0d;border:1px solid ${accent}33;border-radius:12px;margin:0 0 24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="color:${accent};font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">✨ Ce qui rend cette signature unique</p>
                  <p style="color:#e8e8ff;font-size:14px;line-height:1.6;margin:0;">${content.section_magic}</p>
                </td>
              </tr>
            </table>

            <p style="color:rgba(232,232,255,0.6);font-size:13px;margin:0 0 28px;">${content.instructions_rapides}</p>

            <!-- CTA PRINCIPAL -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
              <tr>
                <td align="center">
                  <a href="${previewUrl}" style="display:inline-block;background:linear-gradient(135deg,${accent},${accent}bb);color:white;text-decoration:none;border-radius:50px;padding:16px 36px;font-size:15px;font-weight:600;letter-spacing:0.3px;">${content.cta}</a>
                </td>
              </tr>
            </table>

            <!-- CTA SECONDAIRE -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="${downloadUrl}" style="display:inline-block;background:transparent;color:rgba(232,232,255,0.5);text-decoration:none;border:1px solid rgba(255,255,255,0.15);border-radius:50px;padding:12px 28px;font-size:13px;">⬇ Télécharger le package complet</a>
                </td>
              </tr>
            </table>

            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 24px;">

            <p style="color:rgba(232,232,255,0.8);font-size:14px;margin:0 0 4px;">${content.signature_expediteur}</p>
            <p style="color:${accent};font-size:12px;margin:0 0 20px;">EffectForge AI</p>

            ${content.ps ? `<p style="color:rgba(232,232,255,0.4);font-size:12px;font-style:italic;margin:0;">P.S. — ${content.ps}</p>` : ''}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0a0e1a;border:1px solid ${accent}22;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="color:rgba(232,232,255,0.2);font-size:11px;margin:0 0 4px;">Signature ID : ${signatureId}</p>
            <p style="color:rgba(232,232,255,0.15);font-size:10px;margin:0;">EffectForge AI — God Tier Signatures™</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export async function sendDeliveryEmail(params: {
  toEmail: string;
  clientName: string;
  content: DeliveryEmailContent;
  signatureId: string;
  previewUrl: string;
  downloadUrl: string;
  accent: string;
  gmailPdfBuffer: Buffer;
  outlookPdfBuffer: Buffer;
  applePdfBuffer: Buffer;
}): Promise<{ success: boolean; emailId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    log('RESEND_API_KEY non configurée — email non envoyé', 'delivery-email');
    return { success: false, error: 'RESEND_API_KEY non configurée' };
  }

  try {
    const resend = new Resend(apiKey);
    const htmlBody = buildEmailHtml(params);

    const { data, error } = await resend.emails.send({
      from: 'EffectForge AI <signatures@effectforge.ai>',
      to: params.toEmail,
      subject: params.content.sujet,
      html: htmlBody,
      attachments: [
        {
          filename: 'instructions-gmail.pdf',
          content: params.gmailPdfBuffer,
        },
        {
          filename: 'instructions-outlook.pdf',
          content: params.outlookPdfBuffer,
        },
        {
          filename: 'instructions-apple-mail.pdf',
          content: params.applePdfBuffer,
        },
      ],
    });

    if (error) {
      log(`Erreur envoi email: ${error.message}`, 'delivery-email');
      return { success: false, error: error.message };
    }

    log(`Email de livraison envoyé à ${params.toEmail} — ID: ${data?.id}`, 'delivery-email');
    return { success: true, emailId: data?.id };
  } catch (err: any) {
    log(`Exception envoi email: ${err.message}`, 'delivery-email');
    return { success: false, error: err.message };
  }
}
