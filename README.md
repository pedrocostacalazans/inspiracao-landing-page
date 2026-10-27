# InspirAção — Landing Page Oficial

Landing page oficial de divulgação da startup **InspirAção** e do seu aplicativo mobile para apoio à rotina de cuidados respiratórios e controle da asma.

Construída **exclusivamente com HTML5, CSS3 e JavaScript puro (Vanilla JS)**, sem dependências externas de build, pronta para hospedagem direta no **GitHub Pages**.

---

## ✨ Destaques Visuais e Interativos

1. **O Céu Dinâmico das 24 Horas (`SkyPalette`)**:
   - Seletor interativo no Hero (*Amanhecer 06:30*, *Dia Solar 12:00*, *Entardecer 18:24* e *Noite Profunda 23:00*) que interpola as cores canônicas do céu, move o astro solar/lunar, renderiza partículas atmosféricas em `<canvas>` e sincroniza o mockup do celular.
2. **Simulador Interativo do Aplicativo no Hero**:
   - **Orbe Líquido (`OrbLiquid`)**: Clique no orbe para registrar a dose das `20:00`, observar o líquido descer proporcionalmente ao consumo de jatos, ver o selo do horizonte mudar para concluído (`✓`) e testar o **Toast Canônico com botão "Desfazer"**.
   - **Navegação entre as 4 abas reais do app**: *Hoje*, *Plano de Ação*, *Aprender* e *Relatório*.
3. **Catálogo Oficial CMED/ANVISA + Simulador de Scanner GTIN**:
   - Busca instantânea por princípio ativo, nome comercial ou código EAN/GTIN e simulação de leitura de código de barras.
4. **Experiência Guiada "Respire com o Ventu"**:
   - Exercício respiratório interativo no ritmo fisiológico de 4s de inspiração e 4s de expiração, além de galeria interativa com as expressões oficiais do mascote **Ventu**.
5. **Simulador de Check-in de Sintomas e Gatilhos (`CheckInCard`)**:
   - Utiliza os ícones autorais do app para demonstrar o registro rápido de sintomas e fatores ambientais.
6. **Prévia do Relatório Clínico em PDF A4**:
   - Demonstração visual dos 8 indicadores executivos, análise de possível associação temporal após falha de dose e calendário de adesão.

---

## 📂 Estrutura de Arquivos

```text
inspiracao-landing-page/
├── index.html          # Estrutura semântica principal, SEO e Open Graph
├── .nojekyll           # Otimização para deploy direto no GitHub Pages
├── css/
│   └── styles.css      # Design System InspirAção (tokens, animações, responsividade)
├── js/
│   └── app.js          # Motor de partículas, simuladores interativos e UI
└── assets/
    ├── images/         # Logo oficial, mascote Ventu e ilustrações do app
    └── icons/          # Ícones ilustrados de sintomas e gatilhos
```

---

## 🚀 Como Publicar no GitHub Pages

1. Inicialize o repositório Git (caso ainda não esteja inicializado) e envie para o GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: landing page oficial InspirAção"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/inspiracao-landing-page.git
   git push -u origin main
   ```
2. No repositório do GitHub, acesse **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`, e clique em **Save**.
