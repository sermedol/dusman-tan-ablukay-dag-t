# ADR 0001: Monorepo Yapısı Seçimi

## Durum

Kabul edildi

## Bağlam

Umut-Sen platformu 4 ana uygulamadan (web, admin, api, worker) ve 8+ paylaşılan paket'ten oluşur. Paketler arasında kod, tip ve bağımlılık paylaşımı gerekli.

## Karar

**pnpm + Turborepo** kullanarak monorepo yapısı kurulacak.

## Gerekçe

1. **Type safety:** Paylaşılan TypeScript types tüm paketler arasında tek kaynak (DRY)
2. **Dependency management:** pnpm hoisting, workspace'ler, peer dependency çözümleme
3. **Build optimization:** Turbo caching ve parallelization
4. **Developer experience:** Single `pnpm install`, `pnpm dev` for all apps
5. **Atomic commits:** İlişkili değişiklikler bir commit'te

## Alternatifler

| Yaklaşım | Avantaj | Dezavantaj |
|----------|---------|-----------|
| Monorepo (seçilen) | Shared types, single install, atomic changes | Monorepo kompleksitesi |
| Multi-repo | Loose coupling, independent deployment | Type sync sorunları, multiple installs |
| Submodules | Git isolation | Merge conflict'leri, kompleks workflow |

## Sonuçlar

1. **Paket yapısı:**
   ```
   apps/web, apps/admin, apps/api, apps/worker
   packages/ui, packages/database, packages/auth, ...
   ```

2. **Workspace'ler:** pnpm-workspace.yaml tarafından yönetilir

3. **Build orchestration:** Turbo pipeline ve caching

4. **Constraints:** 
   - apps → packages depend'lerdir
   - packages arasında circular depend'lik yasak

## Sonraki Adımlar

- [ ] Paket yapılarını oluştur
- [ ] TypeScript path mappings kur
- [ ] Share component library (ui/) kur
- [ ] Database schema ve migrations (packages/database)
