# Polígonos das 21 províncias (Lei n.º 14/24)

Base: geoBoundaries AGO ADM1 (províncias históricas) + agregação ADM2 (municípios)
para as cisões da Lei n.º 14/24.

## Fronteiras das 3 novas (aproximação oficial por municípios)

Não existe ainda ADM1 aberto completo com as 21 províncias. As fronteiras abaixo
agregam municípios geoBoundaries ADM2 alinhados com a composição da Lei 14/24
e fontes públicas (Wikipedia / angola-geo):

| Código | Província | Municípios ADM2 agregados |
|--------|-----------|---------------------------|
| ICB | Ícolo e Bengo | Icolo e Bengo, Quissama |
| CUA | Cuando | Cuito Cuanavale, Dirico, Mavinga, Rivungo |
| CUB | Cubango | Menongue, Cuchi, Cuangar, Calai, Nancova |
| MLX | Moxico Leste | Alto Zambeze, Cameia (Lumeje), Luacano, Luau |
| MOX | Moxico | Luena, Leua, Camanongue, Luchazes, Bundas |
| LUA | Luanda | Luanda, Belas, Cacuaco |

Nota: municípios criados em 2025 (ex.: Sequele, Cabiri como unidades autónomas)
ainda não constam no ADM2 público; a geometria de Ícolo e Bengo cobre o território
histórico disponível (antigo município + Quiçama).

## Regenerar

```powershell
python scripts/_rebuild_province_borders.py
.\scripts\artisan.ps1 db:seed --class=ProvinceSeeder
```
