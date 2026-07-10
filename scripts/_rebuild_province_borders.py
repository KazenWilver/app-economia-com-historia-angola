"""Reconstrói fronteiras das 3 novas províncias a partir de municípios ADM2."""

from __future__ import annotations

import json
from pathlib import Path

from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parents[1]
ADM2_PATH = ROOT / "backend/database/data/_ago_adm2_tmp.geojson"
OUT_PATH = ROOT / "backend/database/data/angola-provinces.geojson"

GROUPS: dict[str, list[str]] = {
    # Cuando: metade oriental (Lei 14/24 / Wikipedia)
    "CUA": ["Cuito Cuanavale", "Dirico", "Mavinga", "Rivungo"],
    # Cubango: metade ocidental
    "CUB": ["Menongue", "Cuchi", "Cuangar", "Calai", "Nancova"],
    # Moxico Leste: municípios orientais históricos
    "MLX": ["Alto Zambeze", "Cameia (Lumeje)", "Luacano", "Luau"],
    # Moxico (oeste)
    "MOX": ["Luena", "Leua", "Camanongue", "Luchazes", "Bundas"],
    # Ícolo e Bengo: municípios oficiais ainda presentes no ADM2
    "ICB": ["Icolo e Bengo", "Quissama"],
    # Luanda metropolitana residual no ADM2
    "LUA": ["Luanda", "Belas", "Cacuaco"],
}

META: dict[str, str] = {
    "BGO": "Bengo",
    "BGU": "Benguela",
    "BIE": "Bié",
    "CAB": "Cabinda",
    "CUB": "Cubango",
    "CUA": "Cuando",
    "CNO": "Cuanza Norte",
    "CSU": "Cuanza Sul",
    "CNN": "Cunene",
    "HUA": "Huambo",
    "HUI": "Huíla",
    "ICB": "Ícolo e Bengo",
    "LUA": "Luanda",
    "LNO": "Lunda Norte",
    "LSU": "Lunda Sul",
    "MAL": "Malanje",
    "MOX": "Moxico",
    "MLX": "Moxico Leste",
    "NAM": "Namibe",
    "UIG": "Uíge",
    "ZAI": "Zaire",
}


def union_names(by_name: dict[str, dict], names: list[str]) -> dict:
    geoms = []
    missing = []
    for name in names:
        feature = by_name.get(name)
        if feature is None:
            missing.append(name)
            continue
        geom = shape(feature["geometry"])
        if not geom.is_valid:
            geom = geom.buffer(0)
        geoms.append(geom)

    if missing:
        raise SystemExit(f"Municípios em falta no ADM2: {missing}")

    united = unary_union(geoms)
    if isinstance(united, Polygon):
        united = MultiPolygon([united])
    united = united.simplify(0.01, preserve_topology=True)
    if isinstance(united, Polygon):
        united = MultiPolygon([united])
    return mapping(united)


def main() -> None:
    adm2 = json.loads(ADM2_PATH.read_text(encoding="utf-8"))
    by_name = {f["properties"]["shapeName"]: f for f in adm2["features"]}
    current = json.loads(OUT_PATH.read_text(encoding="utf-8"))
    current_by_code = {f["properties"]["code"]: f for f in current["features"]}

    features = []
    for code, name in META.items():
        if code in GROUPS:
            geometry = union_names(by_name, GROUPS[code])
            source = "ADM2 union (municípios Lei 14/24)"
        else:
            geometry = current_by_code[code]["geometry"]
            source = "geoBoundaries ADM1"

        features.append(
            {
                "type": "Feature",
                "properties": {"code": code, "name": name, "source": source},
                "geometry": geometry,
            }
        )
        print(code, geometry["type"], "ok")

    OUT_PATH.write_text(
        json.dumps(
            {"type": "FeatureCollection", "features": features},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print("written", len(features), "features")
    print("size KB", round(OUT_PATH.stat().st_size / 1024, 1))


if __name__ == "__main__":
    main()
