# @rbxts/scale-model

## Uniformly scale Models and Parts and all Descendants

### Currently Scaling the following types:

* Model
* BasePart
* Attachment
* SpecialMesh
* Fire
* ParticleEmitter

## Usage

1. Install package
```bash
npm i @rbxts/scale-model
```

2. Import `scaleModel` or `scalePart`
```typescript
import { scaleModel, scalePart } from '@rbxts/scale-model';
```
3. Pass a Model or Part, with a scale factor.  Scale factor > 1 is bigger, < 1 is smaller
```typescript
scaleModel(myModel, 1.5);
```

### Did I miss your favorite Descendant?

[Pull Requests](https://github.com/FirstVertex/rbxts-scale-model/pulls) are welcome if there's something I missed.  Or, [open an Issue](https://github.com/FirstVertex/rbxts-scale-model/issues).

### Roblox-TS

Part of the ever-growing [Roblox-TS](https://roblox-ts.com/) community.

### Roblox

Friend me on Roblox, my Avatar is [FirstVertex](https://www.roblox.com/users/2031724732/profile).

## :v: