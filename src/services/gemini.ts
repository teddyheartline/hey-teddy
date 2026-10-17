import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';
let aiInstance: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiInstance = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

export const DEFAULT_TEDORA_SYSTEM_PROMPT = `Tu es Tedora, l'assistant IA personnel et professionnel de Teddy et de BUSSO Studios sur la plateforme Hey Teddy.
Teddy est un photographe d'art, de mode, de mariage et de portrait d'exception à la tête de BUSSO Studios.
Ton rôle est de représenter le studio et d'assister chaleureusement les clients et les visiteurs.

Tes missions principales :
1. Répondre aux questions fréquentes concernant BUSSO Studios et Hey Teddy.
2. Expliquer comment accéder à une galerie privée : les clients reçoivent un lien sécurisé unique par WhatsApp ou SMS. Après connexion, la galerie apparaît automatiquement dans leur nouvel espace "Studio" dans la barre de navigation !
3. Expliquer le téléchargement : téléchargement des photos et vidéos originales en haute définition sans compression, ou de la totalité de la séance en archive ZIP en un seul clic.
4. Expliquer le consentement photo par photo : Sur Hey Teddy, le respect de la vie privée est absolu. Le client contrôle chaque photo individuellement ("J'autorise le studio à proposer cette photo pour une publication publique sur Hey Teddy"). Une fois proposée, l'administrateur peut la valider pour le fil public. Le client peut retirer son accord à tout moment.
5. Coordonnées de contact officielles de BUSSO Studios :
   - Numéro WhatsApp professionnel : +228 01 60 60 97 87 (Lien direct : https://wa.me/2280160609787)
   - TikTok : https://www.tiktok.com/@brosansfiltre?_r=1&_t=ZS-9AZ0Gs92mZE
   - Instagram : https://instagram.com/_teddy_flex?srtk=MTV6cmI5MWppaWJ1YQ%3D%3D
6. Ton : Poli, chaleureux, professionnel, naturel et bienveillant en français. Sois concis et élégant. Si une demande dépasse tes compétences (devis spécifique, réclamation, demande urgente), invite gentiment le client à contacter Teddy sur son WhatsApp officiel : +228 01 60 60 97 87.`;

export async function askTedora(
  prompt: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  customSystemPrompt?: string
): Promise<string> {
  const activePrompt = customSystemPrompt || DEFAULT_TEDORA_SYSTEM_PROMPT;

  if (aiInstance) {
    try {
      const contents = [
        { role: 'user', parts: [{ text: `${activePrompt}\n\nHistorique de la conversation :` }] },
        ...history.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
        { role: 'user', parts: [{ text: prompt }] },
      ];

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
      });

      return response.text || "Bonjour ! Je suis Tedora, à votre service pour vous orienter chez BUSSO Studios & Hey Teddy.";
    } catch (error) {
      console.warn('Gemini API query error, falling back to smart assistance:', error);
    }
  }

  // Fallback intelligent rules if API key is unconfigured or rate limited
  const lower = prompt.toLowerCase();
  if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
    return "Bonjour ! Je suis Tedora, l'assistant officiel de Teddy chez BUSSO Studios. Comment puis-je vous accompagner aujourd'hui ? Avez-vous une question sur vos galeries privées, sur une séance photo ou sur l'application Hey Teddy ?";
  }
  if (lower.includes('studio') || lower.includes('galerie') || lower.includes('télécharger') || lower.includes('zip') || lower.includes('lien')) {
    return "Pour retrouver vos galeries, ouvrez simplement le lien privé envoyé par Teddy. Dès que votre accès est confirmé, l'icône 'Studio' apparaît directement dans votre barre de navigation. Vous pouvez y consulter vos clichés en haute résolution originale et télécharger toute la séance au format ZIP !";
  }
  if (lower.includes('public') || lower.includes('feed') || lower.includes('consentement') || lower.includes('autorisation') || lower.includes('accord')) {
    return "Chez BUSSO Studios, vous gardez le contrôle total de votre image photo par photo. Dans votre galerie, vous pouvez choisir individuellement quelle photo vous autorisez Teddy à proposer pour le fil d'actualité public. Sans votre accord explicite, vos photos restent 100% privées.";
  }
  if (lower.includes('whatsapp') || lower.includes('contact') || lower.includes('téléphone') || lower.includes('reserver') || lower.includes('prix')) {
    return "Vous pouvez contacter directement Teddy sur son numéro WhatsApp officiel : +228 01 60 60 97 87 (https://wa.me/2280160609787) pour toute demande de réservation, tarif ou question particulière.";
  }
  if (lower.includes('qui es-tu') || lower.includes('tedora')) {
    return "Je suis Tedora, l'assistant intelligent de BUSSO Studios & Hey Teddy. Je suis là pour vous assister et faciliter vos échanges avec le studio !";
  }

  return "Merci pour votre message ! Je suis à votre disposition pour vous orienter sur vos galeries dans l'espace Studio, la livraison haute définition ou les prestations de BUSSO Studios. Vous pouvez également échanger avec Teddy directement sur WhatsApp au +228 01 60 60 97 87.";
}
