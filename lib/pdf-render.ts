import puppeteer from "puppeteer";

// Rendu HTML → PDF commun aux factures et devis.
// Le HTML contient des données saisies par les utilisateurs (et les modèles
// personnalisés sont du HTML libre) : JavaScript désactivé et toute requête
// réseau bloquée, sauf les ressources embarquées (data:). Plus d'iframe vers
// une URL interne ni de script exécuté dans Chromium. Le navigateur est
// toujours fermé, même en cas d'erreur, avec un délai maximal.
export async function renderPdf(html: string): Promise<Uint8Array> {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
        const page = await browser.newPage();
        await page.setJavaScriptEnabled(false);
        await page.setRequestInterception(true);
        page.on("request", (request) => {
            const url = request.url();
            if (url.startsWith("data:") || url === "about:blank") request.continue();
            else request.abort();
        });
        await page.setContent(html, { waitUntil: "load", timeout: 15_000 });
        return await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
            timeout: 30_000,
        });
    } finally {
        await browser.close();
    }
}
