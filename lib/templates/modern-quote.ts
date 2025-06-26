export const modernQuoteTemplate = {
    id: "modern-quote-template",
    name: "Modern - Devis",
    description: "Template moderne et épuré pour vos devis avec un design professionnel",
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
                    {{#if company.logo}}
                    <img src="{{company.logo}}" alt="{{company.name}}" class="company-logo">
                    {{/if}}
                    <div class="company-details">
                        <h1>{{company.name}}</h1>
                        <p>{{company.address}}</p>
                        <p>{{company.city}}, {{company.postalCode}}</p>
                        <p>{{company.country}}</p>
                        <p>Email: {{company.email}}</p>
                        <p>Tél: {{company.phone}}</p>
                        {{#if company.siret}}
                        <p>SIRET: {{company.siret}}</p>
                        {{/if}}
                        {{#if company.vatNumber}}
                        <p>TVA: {{company.vatNumber}}</p>
                        {{/if}}
                    </div>
                </div>
                <div class="quote-meta">
                    <h2>DEVIS</h2>
                    <div class="quote-number">N° {{quote.number}}</div>
                    <div class="dates">
                        <p><strong>Date d'émission:</strong> {{quote.issueDate}}</p>
                        <p><strong>Valide jusqu'au:</strong> {{quote.validUntil}}</p>
                    </div>
                </div>
            </header>

            <div class="client-info">
                <h3>Devisé pour:</h3>
                <div class="client-details">
                    <p><strong>{{client.name}}</strong></p>
                    <p>{{client.address}}</p>
                    <p>{{client.city}}, {{client.postalCode}}</p>
                    <p>{{client.country}}</p>
                    <p>{{client.email}}</p>
                    {{#if client.siret}}
                    <p>SIRET: {{client.siret}}</p>
                    {{/if}}
                </div>
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
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f8f9fa;
        padding: 20px;
    }

    .quote-container {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .quote-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 3px solid #28a745;
    }

    .company-info {
        display: flex;
        gap: 20px;
    }

    .company-logo {
        max-width: 80px;
        max-height: 80px;
        object-fit: contain;
    }

    .company-details h1 {
        color: #28a745;
        font-size: 24px;
        margin-bottom: 10px;
    }

    .company-details p {
        margin: 2px 0;
        font-size: 14px;
    }

    .quote-meta {
        text-align: right;
    }

    .quote-meta h2 {
        color: #28a745;
        font-size: 28px;
        margin-bottom: 10px;
    }

    .quote-number {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
    }

    .dates p {
        margin: 5px 0;
        font-size: 14px;
    }

    .client-info {
        margin-bottom: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #28a745;
    }

    .client-info h3 {
        color: #28a745;
        margin-bottom: 15px;
        font-size: 18px;
    }

    .client-details p {
        margin: 2px 0;
        font-size: 14px;
    }

    .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
    }

    .items-table th {
        background: #28a745;
        color: white;
        padding: 12px;
        text-align: left;
        font-weight: 600;
    }

    .items-table td {
        padding: 12px;
        border-bottom: 1px solid #eee;
    }

    .items-table tr:nth-child(even) {
        background: #f8f9fa;
    }

    .totals {
        margin-left: auto;
        width: 300px;
    }

    .totals-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #eee;
    }

    .totals-row.total {
        border-top: 2px solid #28a745;
        border-bottom: none;
        font-size: 18px;
        margin-top: 10px;
        padding-top: 15px;
    }

    .notes, .terms {
        margin-top: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
    }

    .notes h4, .terms h4 {
        color: #28a745;
        margin-bottom: 10px;
    }

    .quote-footer {
        margin-top: 40px;
        text-align: center;
        color: #666;
        font-style: italic;
        padding: 20px;
        background: #e8f5e8;
        border-radius: 8px;
        border: 1px solid #28a745;
    }
    `
}; 