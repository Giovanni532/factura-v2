export const minimalQuoteTemplate = {
    id: "minimal-quote-template",
    name: "Minimal - Devis",
    description: "Template minimaliste et épuré pour vos devis",
    type: "quote" as const,
    html: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Devis</title>
        <style>{{CSS}}</style>
    </head>
    <body>
        <div class="quote-container">
            <header class="quote-header">
                <div class="company-info">
                    <h1>{{company.name}}</h1>
                    <p>{{company.address}}</p>
                    <p>{{company.city}}, {{company.postalCode}}</p>
                    <p>{{company.country}}</p>
                    <p>{{company.email}}</p>
                    <p>{{company.phone}}</p>
                    {{#if company.siret}}
                    <p>SIRET: {{company.siret}}</p>
                    {{/if}}
                    {{#if company.vatNumber}}
                    <p>TVA: {{company.vatNumber}}</p>
                    {{/if}}
                </div>
                <div class="quote-meta">
                    <h2>DEVIS</h2>
                    <p class="quote-number">N° {{quote.number}}</p>
                    <p><strong>Date d'émission:</strong> {{quote.issueDate}}</p>
                    <p><strong>Valide jusqu'au:</strong> {{quote.validUntil}}</p>
                </div>
            </header>

            <div class="client-info">
                <h3>Devisé pour:</h3>
                <p><strong>{{client.name}}</strong></p>
                <p>{{client.address}}</p>
                <p>{{client.city}}, {{client.postalCode}}</p>
                <p>{{client.country}}</p>
                <p>{{client.email}}</p>
                {{#if client.siret}}
                <p>SIRET: {{client.siret}}</p>
                {{/if}}
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each items}}
                    <tr>
                        <td>{{description}}</td>
                        <td>{{quantity}}</td>
                        <td>{{unitPrice}} €</td>
                        <td>{{total}} €</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>

            <div class="totals">
                <div class="totals-row">
                    <span>Sous-total HT:</span>
                    <span>{{quote.subtotal}} €</span>
                </div>
                <div class="totals-row">
                    <span>TVA ({{quote.taxRate}}%):</span>
                    <span>{{quote.taxAmount}} €</span>
                </div>
                <div class="totals-row total">
                    <span><strong>Total TTC:</strong></span>
                    <span><strong>{{quote.total}} €</strong></span>
                </div>
            </div>

            {{#if quote.notes}}
            <div class="notes">
                <h4>Notes:</h4>
                <p>{{quote.notes}}</p>
            </div>
            {{/if}}

            {{#if quote.terms}}
            <div class="terms">
                <h4>Conditions générales:</h4>
                <p>{{quote.terms}}</p>
            </div>
            {{/if}}

            <footer class="quote-footer">
                <p>Ce devis est valable 30 jours à compter de sa date d'émission.</p>
            </footer>
        </div>
    </body>
    </html>
    `,
    css: `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #fff;
        padding: 40px;
    }

    .quote-container {
        max-width: 800px;
        margin: 0 auto;
    }

    .quote-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 60px;
        padding-bottom: 30px;
        border-bottom: 1px solid #e0e0e0;
    }

    .company-info h1 {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
    }

    .company-info p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
    }

    .quote-meta {
        text-align: right;
    }

    .quote-meta h2 {
        font-size: 32px;
        font-weight: 300;
        margin-bottom: 20px;
        color: #333;
    }

    .quote-number {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #333;
    }

    .quote-meta p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
    }

    .client-info {
        margin-bottom: 50px;
    }

    .client-info h3 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #333;
    }

    .client-info p {
        margin: 5px 0;
        font-size: 14px;
        color: #666;
    }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 50px;
    }

    .items-table th {
        padding: 15px 0;
        text-align: left;
        font-weight: 600;
        font-size: 14px;
        color: #333;
        border-bottom: 2px solid #e0e0e0;
    }

    .items-table td {
        padding: 15px 0;
        font-size: 14px;
        color: #666;
        border-bottom: 1px solid #f0f0f0;
    }

    .totals {
        margin-left: auto;
        width: 300px;
    }

    .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        font-size: 14px;
        color: #666;
    }

    .totals-row.total {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        border-top: 2px solid #e0e0e0;
        margin-top: 10px;
        padding-top: 20px;
    }

    .notes, .terms {
        margin-top: 50px;
        padding-top: 30px;
        border-top: 1px solid #e0e0e0;
    }

    .notes h4, .terms h4 {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #333;
    }

    .notes p, .terms p {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
    }

    .quote-footer {
        margin-top: 60px;
        text-align: center;
        color: #999;
        font-size: 14px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 4px;
    }
    `
}; 