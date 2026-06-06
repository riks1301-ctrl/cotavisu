export type ServiceOption = {
  id: string
  label: string
}

export type ServiceConfig = {
  name: string
  icon: string
  unit: "cm2" | "unit" | "linear_cm"
  showDimensions: boolean
  attributes: {
    key: string
    label: string
    options: ServiceOption[]
    required: boolean
  }[]
}

// Tipo específico para itens de PDV (pedido com múltiplos itens)
export type PDVItem = {
  id: string
  name: string
  icon: string
  description: string
  unit: "cm2" | "unit" | "linear_cm"
  dimensionLabel: string // ex: "Largura × Altura", "Comprimento", "Altura × Base"
  widthLabel?: string
  heightLabel?: string
  attributes: {
    key: string
    label: string
    options: ServiceOption[]
    required: boolean
  }[]
}

export const pdvItems: PDVItem[] = [
  {
    id: "wobbler",
    name: "Wobbler",
    icon: "🏷️",
    description: "Tag suspensa que balança na gôndola",
    unit: "cm2",
    dimensionLabel: "Largura × Altura",
    widthLabel: "Largura (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "pp", label: "PP (polipropileno) — padrão" },
          { id: "pvc_05mm", label: "PVC 0,5mm (fino)" },
          { id: "pvc_1mm", label: "PVC 1mm" },
          { id: "ps_05mm", label: "PS 0,5mm (leve)" },
          { id: "ps_1mm", label: "PS 1mm" },
          { id: "papel_couche", label: "Papel couché laminado" },
        ],
      },
      {
        key: "laminacao",
        label: "Laminação",
        required: false,
        options: [
          { id: "sem", label: "Sem laminação" },
          { id: "fosca", label: "Fosca" },
          { id: "brilhante", label: "Brilhante" },
        ],
      },
    ],
  },
  {
    id: "clip_strip",
    name: "Clip Strip",
    icon: "📎",
    description: "Tira plástica com ganchos para pendurar produtos",
    unit: "unit",
    dimensionLabel: "Comprimento",
    widthLabel: "Comprimento (cm)",
    attributes: [
      {
        key: "ganchos",
        label: "Número de ganchos",
        required: true,
        options: [
          { id: "4", label: "4 ganchos" },
          { id: "6", label: "6 ganchos" },
          { id: "8", label: "8 ganchos" },
          { id: "12", label: "12 ganchos" },
        ],
      },
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "pvc_transparente", label: "PVC transparente" },
          { id: "pp_colorido", label: "PP colorido" },
        ],
      },
    ],
  },
  {
    id: "regua_gondola",
    name: "Régua de Gôndola",
    icon: "📏",
    description: "Faixa frontal da prateleira com informação de preço/produto",
    unit: "linear_cm",
    dimensionLabel: "Comprimento × Altura",
    widthLabel: "Comprimento (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "papel_adesivo", label: "Papel adesivo" },
          { id: "pp", label: "PP rígido" },
          { id: "pvc_05mm", label: "PVC 0,5mm" },
          { id: "pvc_1mm", label: "PVC 1mm" },
          { id: "ps_05mm", label: "PS 0,5mm" },
          { id: "ps_1mm", label: "PS 1mm" },
        ],
      },
      {
        key: "impressao",
        label: "Impressão",
        required: true,
        options: [
          { id: "digital", label: "Digital colorida" },
          { id: "pb", label: "Preto e branco" },
        ],
      },
    ],
  },
  {
    id: "totem",
    name: "Totem Promocional",
    icon: "🗿",
    description: "Display vertical de chão para destaque de produto",
    unit: "cm2",
    dimensionLabel: "Largura × Altura",
    widthLabel: "Largura (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "papelao", label: "Papelão recortado (econômico)" },
          { id: "pvc_2mm", label: "PVC 2mm" },
          { id: "pvc_3mm", label: "PVC 3mm" },
          { id: "pvc_5mm", label: "PVC 5mm" },
          { id: "ps_05mm", label: "PS 0,5mm (fino)" },
          { id: "ps_1mm", label: "PS 1mm" },
          { id: "ps_2mm", label: "PS 2mm" },
          { id: "acm", label: "ACM" },
          { id: "mdf", label: "MDF pintado" },
        ],
      },
      {
        key: "base",
        label: "Base/suporte",
        required: true,
        options: [
          { id: "propria", label: "Base própria inclusa" },
          { id: "sem_base", label: "Sem base (parede)" },
        ],
      },
      {
        key: "laminacao",
        label: "Acabamento",
        required: false,
        options: [
          { id: "sem", label: "Sem laminação" },
          { id: "fosco", label: "Laminação fosca" },
          { id: "brilhante", label: "Laminação brilhante" },
        ],
      },
    ],
  },
  {
    id: "cubo_promocional",
    name: "Cubo Promocional",
    icon: "🎲",
    description: "Display cúbico para balcão ou expositor",
    unit: "unit",
    dimensionLabel: "Tamanho do lado",
    widthLabel: "Lado do cubo (cm)",
    attributes: [
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "papelao", label: "Papelão montável" },
          { id: "pvc_2mm", label: "PVC 2mm" },
          { id: "pvc_3mm", label: "PVC 3mm" },
          { id: "ps_05mm", label: "PS 0,5mm (fino/leve)" },
          { id: "ps_1mm", label: "PS 1mm" },
          { id: "ps_2mm", label: "PS 2mm" },
          { id: "acrilico", label: "Acrílico" },
          { id: "mdf", label: "MDF" },
        ],
      },
      {
        key: "faces",
        label: "Impressão nas faces",
        required: true,
        options: [
          { id: "todas", label: "Todas as 6 faces" },
          { id: "4_faces", label: "4 faces laterais" },
          { id: "1_face", label: "Somente 1 face (frontal)" },
        ],
      },
    ],
  },
  {
    id: "mobile_suspenso",
    name: "Mobile Suspenso",
    icon: "🪁",
    description: "Peça suspensa que gira e chama atenção no teto da loja",
    unit: "cm2",
    dimensionLabel: "Largura × Altura por face",
    widthLabel: "Largura (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "faces",
        label: "Número de faces",
        required: true,
        options: [
          { id: "2", label: "2 faces (dupla face)" },
          { id: "3", label: "3 faces" },
          { id: "4", label: "4 faces" },
        ],
      },
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "papel_laminado", label: "Papel laminado" },
          { id: "pp", label: "PP (mais durável)" },
          { id: "acrilico", label: "Acrílico" },
        ],
      },
    ],
  },
  {
    id: "display_balcao",
    name: "Display de Balcão",
    icon: "🖼️",
    description: "Suporte de balcão para catálogos, cardápios ou produtos",
    unit: "cm2",
    dimensionLabel: "Largura × Altura",
    widthLabel: "Largura (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "acrilico", label: "Acrílico cristal" },
          { id: "pvc_1mm", label: "PVC 1mm" },
          { id: "pvc_2mm", label: "PVC 2mm" },
          { id: "ps_05mm", label: "PS 0,5mm (leve)" },
          { id: "ps_1mm", label: "PS 1mm" },
          { id: "papel_rigido", label: "Papel rígido (papelão)" },
        ],
      },
      {
        key: "bolsos",
        label: "Bolsos",
        required: false,
        options: [
          { id: "sem", label: "Sem bolso (só base)" },
          { id: "1", label: "1 bolso A4" },
          { id: "2", label: "2 bolsos" },
        ],
      },
    ],
  },
  {
    id: "testeira",
    name: "Testeira",
    icon: "📢",
    description: "Faixa superior da gôndola para identificação de seção",
    unit: "linear_cm",
    dimensionLabel: "Comprimento × Altura",
    widthLabel: "Comprimento (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "papel_adesivo", label: "Adesivo impresso" },
          { id: "pvc_1mm", label: "PVC 1mm impresso" },
          { id: "pvc_2mm", label: "PVC 2mm impresso" },
          { id: "ps_05mm", label: "PS 0,5mm impresso" },
          { id: "ps_1mm", label: "PS 1mm impresso" },
          { id: "acm", label: "ACM com impressão" },
        ],
      },
    ],
  },
  {
    id: "take_one",
    name: "Take One",
    icon: "📄",
    description: "Porta-folhetos de parede ou gôndola",
    unit: "unit",
    dimensionLabel: "Formato do folheto",
    widthLabel: "Largura (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "formato",
        label: "Formato do folheto",
        required: true,
        options: [
          { id: "a5", label: "A5 (14,8×21cm)" },
          { id: "a4", label: "A4 (21×29,7cm)" },
          { id: "dl", label: "DL (10×21cm) — 1/3 A4" },
        ],
      },
      {
        key: "material_porta",
        label: "Material do porta-folheto",
        required: true,
        options: [
          { id: "acrilico", label: "Acrílico cristal" },
          { id: "pvc", label: "PVC" },
        ],
      },
    ],
  },
  {
    id: "stopper",
    name: "Stopper de Gôndola",
    icon: "🚩",
    description: "Flag lateral que se projeta da prateleira",
    unit: "cm2",
    dimensionLabel: "Largura × Altura",
    widthLabel: "Largura (cm)",
    heightLabel: "Altura (cm)",
    attributes: [
      {
        key: "material",
        label: "Material",
        required: true,
        options: [
          { id: "pp", label: "PP (polipropileno)" },
          { id: "pvc_05mm", label: "PVC 0,5mm" },
          { id: "pvc_1mm", label: "PVC 1mm" },
          { id: "ps_05mm", label: "PS 0,5mm (leve)" },
          { id: "ps_1mm", label: "PS 1mm" },
          { id: "papel_laminado", label: "Papel laminado" },
        ],
      },
    ],
  },
]

export type CategoryConfig = {
  name: string
  icon: string
  services: ServiceConfig[]
}

export const serviceCategories: CategoryConfig[] = [
  {
    name: "PDV — Materiais de Loja",
    icon: "🏪",
    services: [], // PDV usa fluxo próprio com múltiplos itens
  },
  {
    name: "Adesivos",
    icon: "🏷️",
    services: [
      {
        name: "Adesivo Impresso",
        icon: "🖨️",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "material",
            label: "Material",
            required: true,
            options: [
              { id: "vinil_comum", label: "Vinil Comum" },
              { id: "vinil_perfurado", label: "Vinil Perfurado (micro-furos)" },
              { id: "vinil_espelhado", label: "Vinil Espelhado" },
              { id: "vinil_transparente", label: "Vinil Transparente" },
              { id: "bopp", label: "BOPP (papel couché adesivo)" },
            ],
          },
          {
            key: "laminacao",
            label: "Laminação",
            required: true,
            options: [
              { id: "sem_laminacao", label: "Sem laminação" },
              { id: "fosca", label: "Laminação Fosca" },
              { id: "brilhante", label: "Laminação Brilhante" },
              { id: "soft_touch", label: "Soft Touch (veludo)" },
              { id: "holografica", label: "Holográfica" },
            ],
          },
          {
            key: "acabamento",
            label: "Acabamento/Corte",
            required: true,
            options: [
              { id: "reto", label: "Corte Reto" },
              { id: "vinco", label: "Com Vinco (dobra)" },
              { id: "contorno", label: "Corte no Contorno" },
              { id: "circulo", label: "Circular" },
            ],
          },
          {
            key: "aplicacao",
            label: "Local de aplicação",
            required: false,
            options: [
              { id: "interno", label: "Interno" },
              { id: "externo", label: "Externo" },
              { id: "vidro", label: "Vidro" },
              { id: "veiculo", label: "Veículo" },
              { id: "piso", label: "Piso" },
            ],
          },
        ],
      },
      {
        name: "Adesivo Recortado (Plotter)",
        icon: "✂️",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "cor",
            label: "Cor do vinil",
            required: true,
            options: [
              { id: "branco", label: "Branco" },
              { id: "preto", label: "Preto" },
              { id: "vermelho", label: "Vermelho" },
              { id: "azul", label: "Azul" },
              { id: "amarelo", label: "Amarelo" },
              { id: "verde", label: "Verde" },
              { id: "prata", label: "Prata" },
              { id: "dourado", label: "Dourado" },
              { id: "outra", label: "Outra cor (informar)" },
            ],
          },
          {
            key: "durabilidade",
            label: "Durabilidade",
            required: true,
            options: [
              { id: "1ano", label: "Curta (até 1 ano)" },
              { id: "3anos", label: "Média (3 anos)" },
              { id: "5anos", label: "Longa (5 anos)" },
              { id: "cast", label: "Cast Premium (7+ anos)" },
            ],
          },
        ],
      },
      {
        name: "Envelopamento Veicular",
        icon: "🚗",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "tipo",
            label: "Tipo de envelopamento",
            required: true,
            options: [
              { id: "parcial", label: "Parcial (capô, teto, portas)" },
              { id: "total", label: "Total (veículo inteiro)" },
              { id: "faixa", label: "Faixa/detalhe" },
            ],
          },
          {
            key: "acabamento",
            label: "Acabamento do vinil",
            required: true,
            options: [
              { id: "brilhante", label: "Brilhante" },
              { id: "fosco", label: "Fosco" },
              { id: "acetinado", label: "Acetinado" },
              { id: "carbon", label: "Fibra de Carbono" },
              { id: "cromo", label: "Cromado" },
            ],
          },
          {
            key: "instalacao",
            label: "Instalação",
            required: true,
            options: [
              { id: "inclusa", label: "Inclusa no orçamento" },
              { id: "nao_inclusa", label: "Não inclusa" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Banners e Lonas",
    icon: "🚩",
    services: [
      {
        name: "Banner",
        icon: "🏳️",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "material",
            label: "Material",
            required: true,
            options: [
              { id: "lona_280", label: "Lona 280g (econômica)" },
              { id: "lona_340", label: "Lona 340g" },
              { id: "lona_440", label: "Lona 440g (padrão)" },
              { id: "lona_540", label: "Lona 540g (pesada)" },
              { id: "blackout", label: "Lona Blackout (sem transparência)" },
              { id: "frontlit", label: "Frontlit (retroiluminada)" },
            ],
          },
          {
            key: "impressao",
            label: "Impressão",
            required: true,
            options: [
              { id: "frente", label: "Somente frente" },
              { id: "dupla_face", label: "Frente e verso (dupla face)" },
            ],
          },
          {
            key: "acabamento",
            label: "Acabamento",
            required: true,
            options: [
              { id: "ilhos", label: "Ilhós (padrão)" },
              { id: "bastao", label: "Bastão (superior e inferior)" },
              { id: "costurado", label: "Costurado nas bordas" },
              { id: "sem_acabamento", label: "Sem acabamento (cru)" },
              { id: "dobrado", label: "Dobrado e colado" },
            ],
          },
          {
            key: "uso",
            label: "Uso",
            required: false,
            options: [
              { id: "interno", label: "Interno" },
              { id: "externo", label: "Externo" },
              { id: "evento", label: "Evento temporário" },
            ],
          },
        ],
      },
      {
        name: "Lona para Fachada",
        icon: "🏗️",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "material",
            label: "Material",
            required: true,
            options: [
              { id: "lona_440", label: "Lona 440g" },
              { id: "lona_540", label: "Lona 540g" },
              { id: "blackout", label: "Lona Blackout" },
              { id: "mesh", label: "Lona Mesh (perfurada para vento)" },
            ],
          },
          {
            key: "acabamento",
            label: "Acabamento",
            required: true,
            options: [
              { id: "ilhos_30", label: "Ilhós a cada 30cm" },
              { id: "ilhos_50", label: "Ilhós a cada 50cm" },
              { id: "canaleta", label: "Com canaleta de alumínio" },
              { id: "costurado", label: "Costurado e reforçado" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Fachadas e ACM",
    icon: "🏢",
    services: [
      {
        name: "Placa em ACM",
        icon: "🔲",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "espessura",
            label: "Espessura",
            required: true,
            options: [
              { id: "3mm", label: "3mm (padrão)" },
              { id: "4mm", label: "4mm" },
              { id: "6mm", label: "6mm (estrutural)" },
            ],
          },
          {
            key: "acabamento",
            label: "Acabamento da face",
            required: true,
            options: [
              { id: "branco", label: "Branco liso" },
              { id: "preto", label: "Preto liso" },
              { id: "prata", label: "Prata escovado" },
              { id: "dourado", label: "Dourado" },
              { id: "personalizado", label: "Cor personalizada (especificar)" },
            ],
          },
          {
            key: "tipo_impressao",
            label: "Impressão/Arte",
            required: true,
            options: [
              { id: "adesivo", label: "Adesivo impresso colado no ACM" },
              { id: "direto", label: "Impressão direta no ACM (UV)" },
              { id: "sem_impressao", label: "Sem impressão (cor lisa)" },
            ],
          },
          {
            key: "instalacao",
            label: "Instalação",
            required: true,
            options: [
              { id: "inclusa", label: "Inclusa no orçamento" },
              { id: "nao_inclusa", label: "Não inclusa" },
              { id: "consultar", label: "Consultar (fora da cidade)" },
            ],
          },
        ],
      },
      {
        name: "Placa em PVC ou PS",
        icon: "📋",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "material_espessura",
            label: "Material e espessura",
            required: true,
            options: [
              { id: "pvc_05mm", label: "PVC 0,5mm (fino/leve)" },
              { id: "pvc_1mm", label: "PVC 1mm" },
              { id: "pvc_2mm", label: "PVC 2mm" },
              { id: "pvc_3mm", label: "PVC 3mm (padrão)" },
              { id: "pvc_5mm", label: "PVC 5mm (rígido)" },
              { id: "pvc_10mm", label: "PVC 10mm (display)" },
              { id: "ps_05mm", label: "PS 0,5mm (econômico/fino)" },
              { id: "ps_1mm", label: "PS 1mm" },
              { id: "ps_2mm", label: "PS 2mm" },
              { id: "ps_3mm", label: "PS 3mm" },
            ],
          },
          {
            key: "impressao",
            label: "Impressão",
            required: true,
            options: [
              { id: "adesivo", label: "Com adesivo impresso" },
              { id: "uv", label: "Impressão UV direta" },
              { id: "sem", label: "Sem impressão" },
            ],
          },
        ],
      },
      {
        name: "Letra Caixa",
        icon: "🔤",
        unit: "unit",
        showDimensions: true,
        attributes: [
          {
            key: "material",
            label: "Material da letra",
            required: true,
            options: [
              { id: "acrilico", label: "Acrílico" },
              { id: "inox", label: "Inox" },
              { id: "mdf", label: "MDF pintado" },
              { id: "acm", label: "ACM recortado" },
              { id: "foam", label: "Foam (isopor revestido)" },
            ],
          },
          {
            key: "iluminacao",
            label: "Iluminação",
            required: true,
            options: [
              { id: "sem", label: "Sem iluminação" },
              { id: "led_face", label: "LED na face" },
              { id: "led_caixa", label: "LED na caixa (retro)" },
              { id: "neon", label: "Efeito neon (LED flex)" },
            ],
          },
          {
            key: "instalacao",
            label: "Instalação",
            required: true,
            options: [
              { id: "inclusa", label: "Inclusa" },
              { id: "nao_inclusa", label: "Não inclusa" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Plotagem",
    icon: "✂️",
    services: [
      {
        name: "Plotagem de Plantas",
        icon: "📐",
        unit: "unit",
        showDimensions: false,
        attributes: [
          {
            key: "formato",
            label: "Formato",
            required: true,
            options: [
              { id: "a4", label: "A4 (21×29,7cm)" },
              { id: "a3", label: "A3 (29,7×42cm)" },
              { id: "a2", label: "A2 (42×59,4cm)" },
              { id: "a1", label: "A1 (59,4×84,1cm)" },
              { id: "a0", label: "A0 (84,1×118,9cm)" },
            ],
          },
          {
            key: "papel",
            label: "Tipo de papel",
            required: true,
            options: [
              { id: "sulfite75", label: "Sulfite 75g" },
              { id: "sulfite90", label: "Sulfite 90g" },
              { id: "couchê", label: "Couché brilhante" },
              { id: "fotografico", label: "Papel fotográfico" },
            ],
          },
          {
            key: "cor",
            label: "Impressão",
            required: true,
            options: [
              { id: "pb", label: "Preto e branco" },
              { id: "colorida", label: "Colorida" },
            ],
          },
        ],
      },
      {
        name: "Adesivo de Corte (Vinil)",
        icon: "✂️",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "tipo",
            label: "Tipo de vinil",
            required: true,
            options: [
              { id: "opaco", label: "Vinil opaco colorido" },
              { id: "refletivo", label: "Vinil refletivo" },
              { id: "fosco", label: "Vinil fosco" },
              { id: "espelhado", label: "Vinil espelhado" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Luminosos",
    icon: "⚡",
    services: [
      {
        name: "Painel Luminoso",
        icon: "💡",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "tipo",
            label: "Tipo de painel",
            required: true,
            options: [
              { id: "led_face", label: "Painel com LED na face (caixa de luz)" },
              { id: "led_contorno", label: "LED de contorno externo" },
              { id: "neon_flex", label: "Neon flex (LED neon)" },
              { id: "totem", label: "Totem dupla face" },
            ],
          },
          {
            key: "material",
            label: "Material da face",
            required: true,
            options: [
              { id: "acrilico", label: "Acrílico" },
              { id: "lona_frontlit", label: "Lona frontlit" },
              { id: "acm", label: "ACM" },
            ],
          },
          {
            key: "instalacao",
            label: "Instalação",
            required: true,
            options: [
              { id: "inclusa", label: "Inclusa" },
              { id: "nao_inclusa", label: "Não inclusa" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Impressão Digital",
    icon: "🖨️",
    services: [
      {
        name: "Impressão em Papel",
        icon: "📄",
        unit: "unit",
        showDimensions: false,
        attributes: [
          {
            key: "formato",
            label: "Formato",
            required: true,
            options: [
              { id: "a4", label: "A4 (21×29,7cm)" },
              { id: "a3", label: "A3 (29,7×42cm)" },
              { id: "a3plus", label: "A3+ (32×48cm)" },
              { id: "a2", label: "A2 (42×59,4cm)" },
              { id: "personalizado", label: "Formato personalizado" },
            ],
          },
          {
            key: "papel",
            label: "Papel",
            required: true,
            options: [
              { id: "couchê115", label: "Couché 115g brilhante" },
              { id: "couchê170", label: "Couché 170g brilhante" },
              { id: "couchê250", label: "Couché 250g brilhante" },
              { id: "fosco170", label: "Couché 170g fosco" },
              { id: "fosco300", label: "Couché 300g fosco" },
              { id: "fotografico", label: "Papel fotográfico" },
              { id: "canvas", label: "Canvas (tela)" },
            ],
          },
          {
            key: "acabamento",
            label: "Acabamento",
            required: false,
            options: [
              { id: "sem", label: "Sem acabamento" },
              { id: "laminacao_fosca", label: "Laminação fosca" },
              { id: "laminacao_brilhante", label: "Laminação brilhante" },
              { id: "plastificacao", label: "Plastificação" },
            ],
          },
        ],
      },
      {
        name: "Impressão em Rígido (Direto)",
        icon: "🖼️",
        unit: "cm2",
        showDimensions: true,
        attributes: [
          {
            key: "substrato",
            label: "Material/Substrato",
            required: true,
            options: [
              { id: "pvc_3mm", label: "PVC 3mm expandido" },
              { id: "pvc_5mm", label: "PVC 5mm expandido" },
              { id: "pvc_10mm", label: "PVC 10mm expandido" },
              { id: "ps_05mm", label: "PS 0,5mm" },
              { id: "ps_1mm", label: "PS 1mm" },
              { id: "ps_2mm", label: "PS 2mm" },
              { id: "ps_3mm", label: "PS 3mm" },
              { id: "acm", label: "ACM" },
              { id: "madeira", label: "MDF/Madeira" },
              { id: "vidro", label: "Vidro" },
              { id: "metal", label: "Metal/Alumínio" },
              { id: "acrilico", label: "Acrílico" },
            ],
          },
          {
            key: "acabamento",
            label: "Verniz UV",
            required: false,
            options: [
              { id: "sem", label: "Sem verniz" },
              { id: "fosco", label: "Verniz fosco" },
              { id: "brilhante", label: "Verniz brilhante" },
            ],
          },
        ],
      },
    ],
  },
]
