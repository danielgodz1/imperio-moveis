import { describe, expect, it } from 'vitest';
import { mensagemWhatsAppDireto } from '../src/components/BriefingOrcamento';

describe('atalho Falar agora no WhatsApp', () => {
  it('leva o ambiente de onde a pessoa veio', () => {
    expect(mensagemWhatsAppDireto('Cozinha')).toBe('Oi! Vi o site da Império e quero um orçamento de cozinha.');
    expect(mensagemWhatsAppDireto('Home office')).toContain('de home office');
  });
  it('sem ambiente (ou "Outro") fica a mensagem geral', () => {
    expect(mensagemWhatsAppDireto()).toBe('Oi! Vi o site da Império e quero um orçamento.');
    expect(mensagemWhatsAppDireto('Outro')).toBe('Oi! Vi o site da Império e quero um orçamento.');
  });
});
