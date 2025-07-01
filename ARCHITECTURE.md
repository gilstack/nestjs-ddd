# Arquitetura

Este projeto implementa a **Clean Architecture** em conjunto com **Domain Driven Design** para promover uma separação clara das responsabilidades e maximizar a flexibilidade e a manutenibilidade do código.

## Estrutura de Pastas

```text
src/
├── domain/           # 🏛️ Regras de negócio puras
├── application/      # 🎯 Casos de uso e orquestração
├── infrastructure/   # 🔧 Detalhes técnicos
├── presentation/     # 🌐 Interface com o mundo externo
└── shared/           # 🔄 Recursos compartilhados
```

### Benefícios

- **Testabilidade**: Fácil criação de mocks e testes unitários.
- **Manutenibilidade**: Código organizado e desacoplado.
- **Flexibilidade**: Fácil troca de tecnologias.
- **Escalabilidade**: Estrutura preparada para crescimento.

## Detalhes da Arquitetura

### Domain
Contém as regras de negócios puras e entidades do domínio.

### Application
Orquestra casos de uso e integra componentes do domínio e infraestrutura.

### Infrastructure
Gerencia detalhes técnicos como conexões de banco de dados, cache, e serviços externos.

### Presentation
Controla a interface com o usuário ou outros sistemas, através de controladores e modules do NestJS.

### Shared
Recursos compartilhados entre os módulos, como filtros globais, interceptors, e utilidades.

Para mais detalhes sobre cada componente, consulte diretamente os arquivos no repositório.
