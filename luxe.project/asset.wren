//This file is generated. Do not edit directly

import "luxe: assets" for Assets, Strings
import "luxe: blocks" for Block

import "luxe: type/tiles.source.asset" for TilesSourceDesc
import "luxe: type/tiles.visual.asset" for TilesVisualDesc
import "luxe: type/font.face.asset" for FaceDesc
import "luxe: type/font.asset" for FontDesc
import "luxe: type/basis.asset" for Basis
import "luxe: type/tiles.asset" for TilesDesc
import "luxe: type/asset.meta.asset" for AssetMeta
import "luxe: type/compute.asset" for Compute
import "luxe: type/text.style.asset" for TextStyle
import "luxe: type/scene.asset" for SceneDesc

class AssetType {
  static modifier { "luxe: type/modifier.asset" }
  static mesh { "luxe: type/mesh.asset" }
  static anim { "luxe: type/anim.asset" }
  static tiles_source { "luxe: type/tiles.source.asset" }
  static tiles_visual { "luxe: type/tiles.visual.asset" }
  static face { "luxe: type/font.face.asset" }
  static entity { "luxe: type/entity.asset" }
  static prototype { "luxe: type/prototype.asset" }
  static image { "luxe: type/image.asset" }
  static font { "luxe: type/font.asset" }
  static basis { "luxe: type/basis.asset" }
  static tiles { "luxe: type/tiles.asset" }
  static material { "luxe: type/material.asset" }
  static block_def { "luxe: type/block_def.asset" }
  static asset_meta { "luxe: type/asset.meta.asset" }
  static compute { "luxe: type/compute.asset" }
  static text_style { "luxe: type/text.style.asset" }
  static scene { "luxe: type/scene.asset" }
}

class AssetGetAPI {
  construct new() {}
  tiles_source(asset_id: String) : TilesSourceDesc { Asset.instance(AssetType.tiles_source, asset_id) }
  tiles_visual(asset_id: String) : TilesVisualDesc { Asset.instance(AssetType.tiles_visual, asset_id) }
  face(asset_id: String) : FaceDesc { Asset.instance(AssetType.face, asset_id) }
  font(asset_id: String) : FontDesc { Asset.instance(AssetType.font, asset_id) }
  basis(asset_id: String) : Basis { Asset.instance(AssetType.basis, asset_id) }
  tiles(asset_id: String) : TilesDesc { Asset.instance(AssetType.tiles, asset_id) }
  asset_meta(asset_id: String) : AssetMeta { Asset.instance(AssetType.asset_meta, asset_id) }
  compute(asset_id: String) : Compute { Asset.instance(AssetType.compute, asset_id) }
  text_style(asset_id: String) : TextStyle { Asset.instance(AssetType.text_style, asset_id) }
  scene(asset_id: String) : SceneDesc { Asset.instance(AssetType.scene, asset_id) }
}
var AssetGet = AssetGetAPI.new()

class Asset {
  #hidden
  static instance(type_id: String, asset_id: String) {
    var block = Assets.get_block(type_id)
    if(!Block.valid(block)) return null
    var inst = Block.get(block, Strings.add(asset_id))
    return Block.instance(block, inst)
  }
  static get : AssetGetAPI { AssetGet }
  static tiles_source(asset_id: String) : Num { Assets.get_handle(AssetType.tiles_source, asset_id) }
  static tiles_visual(asset_id: String) : Num { Assets.get_handle(AssetType.tiles_visual, asset_id) }
  static face(asset_id: String) : Num { Assets.get_handle(AssetType.face, asset_id) }
  static prototype(asset_id: String) : Num { Assets.get_handle(AssetType.prototype, asset_id) }
  static font(asset_id: String) : Num { Assets.get_handle(AssetType.font, asset_id) }
  static tiles(asset_id: String) : Num { Assets.get_handle(AssetType.tiles, asset_id) }
  static compute(asset_id: String) : Num { Assets.get_handle(AssetType.compute, asset_id) }
  static text_style(asset_id: String) : Num { Assets.get_handle(AssetType.text_style, asset_id) }
  static scene(asset_id: String) : Num { Assets.get_handle(AssetType.scene, asset_id) }
}
