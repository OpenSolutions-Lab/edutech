const assert = require('assert');

// Compilado/transpilado via ts-node ou requisição direta da lógica
function calcularPontuacaoInscricao(dados) {
  const { processoAno } = dados;
  let pontuacaoTotal = 0;
  const detalhamento = {};

  if (processoAno <= 2023) {
    if (dados.temBolsaFamilia || dados.temCartaoFamiliaCarioca) {
      detalhamento["Vulnerabilidade Social (BF/CFC)"] = 100;
      pontuacaoTotal += 100;
    }
    if (dados.possuiDeficiencia) {
      detalhamento["Pessoa com Deficiência (PCD)"] = 80;
      pontuacaoTotal += 80;
    }
    if (dados.rendaPerCapita !== undefined && dados.rendaPerCapita <= 218) {
      detalhamento["Extrema Pobreza"] = 50;
      pontuacaoTotal += 50;
    }
    if (dados.temIrmaoNaUnidade) {
      detalhamento["Irmão Matriculado"] = 20;
      pontuacaoTotal += 20;
    }
    return { pontuacaoTotal, detalhamento, processoAno, reguaAplicada: "Régua Socioeconômica SME 2021-2023" };
  }

  if (processoAno === 2024) {
    if (dados.temCartaoFamiliaCarioca || dados.temBolsaFamilia) {
      detalhamento["Programa Social (CFC/BF)"] = 100;
      pontuacaoTotal += 100;
    }
    if (dados.possuiDeficiencia) {
      detalhamento["Pessoa com Deficiência (PCD)"] = 100;
      pontuacaoTotal += 100;
    }
    if (dados.maeAdolescente) {
      detalhamento["Mãe Adolescente (<18 anos)"] = 40;
      pontuacaoTotal += 40;
    }
    if (dados.temIrmaoNaUnidade) {
      detalhamento["Irmão na mesma unidade"] = 30;
      pontuacaoTotal += 30;
    }
    return { pontuacaoTotal, detalhamento, processoAno, reguaAplicada: "Régua Socioeconômica SME 2024" };
  }

  // 2025
  if (dados.temCartaoFamiliaCarioca) {
    detalhamento["Cartão Família Carioca"] = 100;
    pontuacaoTotal += 100;
  }
  if (dados.possuiDeficiencia) {
    detalhamento["Pessoa com Deficiência (PCD)"] = 100;
    pontuacaoTotal += 100;
  }
  if (dados.maeAdolescente) {
    detalhamento["Mãe Adolescente"] = 50;
    pontuacaoTotal += 50;
  }
  if (dados.distanciaKm !== undefined && dados.distanciaKm <= 1.0) {
    detalhamento["Proximidade (<1km)"] = 30;
    pontuacaoTotal += 30;
  }

  return { pontuacaoTotal, detalhamento, processoAno, reguaAplicada: "Régua Socioeconômica Vigente 2025" };
}

console.log('🧪 Executando Testes Unitários das Réguas Socioeconômicas de Creche (2021-2025)...');

try {
  // Teste 1: Régua 2021-2023
  const res2021 = calcularPontuacaoInscricao({ processoAno: 2021, temBolsaFamilia: true, possuiDeficiencia: true });
  assert.strictEqual(res2021.pontuacaoTotal, 180, 'Pontuação 2021 deveria ser 180');
  console.log('✅ Teste 1: Régua 2021-2023 (BF + PCD = 180 pts) — PASSOU!');

  // Teste 2: Régua 2024
  const res2024 = calcularPontuacaoInscricao({ processoAno: 2024, temCartaoFamiliaCarioca: true, maeAdolescente: true });
  assert.strictEqual(res2024.pontuacaoTotal, 140, 'Pontuação 2024 deveria ser 140');
  console.log('✅ Teste 2: Régua 2024 (CFC + Mãe Adolescente = 140 pts) — PASSOU!');

  // Teste 3: Régua 2025
  const res2025 = calcularPontuacaoInscricao({ processoAno: 2025, temCartaoFamiliaCarioca: true, possuiDeficiencia: true, distanciaKm: 0.5 });
  assert.strictEqual(res2025.pontuacaoTotal, 230, 'Pontuação 2025 deveria ser 230');
  console.log('✅ Teste 3: Régua Vigente 2025 (CFC + PCD + Proximidade = 230 pts) — PASSOU!');

  console.log('🎉 TODOS OS TESTES UNITÁRIOS DE CRECHE PASSARAM COM SUCESSO!');
} catch (e) {
  console.error('❌ Falha nos testes de creche:', e);
  process.exit(1);
}
