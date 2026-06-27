s# Estrutura de Serviços de API - SITFOR

## 📁 Organização

```
src/app/core/services/api/
├── dados-cadastrais/           # API para consulta detalhada por inscrição
│   └── dados-cadastrais.service.ts
├── dados-list/                 # API para listagem por CPF/CNPJ
│   └── dados-list.service.ts
└── index.ts                    # Exports centralizados
```

## 🔗 APIs Disponíveis

### 1. **Dados Cadastrais** (`/app_consulta/dados_cadastrais`)
- **Finalidade**: Consulta detalhada de dados cadastrais por inscrição
- **Serviço**: `DadosCadastraisService`
- **Model**: `inscricao.model.ts`
- **Métodos**:
  - `buscarInscricao(inscricao?: string)`
  - `buscarPorInscricao(inscricao: string)`

### 2. **Dados List** (`/app_consulta/dados_list`)  
- **Finalidade**: Listagem de inscrições por CPF/CNPJ
- **Serviço**: `DadosListService`
- **Model**: `inscricao-cpf-cnpj.model.ts`
- **Métodos**:
  - `buscarPorCpf(cpf: string)`
  - `buscarPorCnpj(cnpj: string)`
  - `buscarPorCpfCnpj(cpfCnpj: string)`
  - `buscarPorInscricao(inscricao: string)`

## 📦 Como Importar

### Importação Individual
```typescript
import { DadosCadastraisService } from '@services/api/dados-cadastrais/dados-cadastrais.service';
import { DadosListService } from '@services/api/dados-list/dados-list.service';
```

### Importação Centralizada
```typescript
import { 
  DadosCadastraisService, 
  DadosListService,
  InscricaoResponse,
  InscricaoDataCpfCnpj 
} from '@services/api';
```

## 🔧 Configuração de URLs

As URLs estão centralizadas em `@core/constants/api.constants.ts`:

```typescript
API_URLS.APP_CONSULTA.DADOS_CADASTRAIS  // Para dados detalhados
API_URLS.APP_CONSULTA.DADOS_LIST        // Para listagens
```

## 🎯 Migração dos Serviços Antigos

### Antes:
```typescript
import { InscricaoService } from '@services/busca/inscricao/inscricao.service';
import { InscricaoCpfCnpjService } from '@services/busca/inscricao/listagem-de-inscricoes.service';
```

### Agora:
```typescript
import { DadosCadastraisService, DadosListService } from '@services/api';
```

## ✅ Benefícios da Nova Estrutura

1. **Alinhamento com APIs**: Cada serviço corresponde a uma API específica
2. **Nomenclatura Clara**: Nomes refletem a funcionalidade real das APIs
3. **Organização Hierárquica**: Estrutura de pastas espelha a estrutura da API
4. **Imports Centralizados**: Arquivo index.ts facilita importações
5. **Documentação**: README e comentários explicam cada API
6. **Manutenibilidade**: Mudanças ficam isoladas por funcionalidade