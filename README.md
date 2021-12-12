# @rbxts/scale-model

## Scale/resize Models and Parts and all Descendants

## Version 2.0 adds non-uniform scaling by number, Vector2, or Vector3

### Currently scaling the following types and properties:

* Model (Size, Position)
* BasePart (Size, Position)
* Attachment (Position) (and thus connected Constraints, e.g. Welds and Joints)
* SpecialMesh (Scale)
* Fire (Size)
* Texture (U/V)
* ParticleEmitter (Size: _NumberSequence_)
* Explosion (Position, BlastPressure, BlastRadius)
* Vector3 (Scale, Scale about Point)
* Tool (All Descendants, using Handle as reference)
* Instances (generic catch-all for e.g. a Folder)

## Usage

1. Install [npm package](https://www.npmjs.com/package/@rbxts/scale-model)
```
npm i @rbxts/scale-model
```

2. Import `scaleModel`, `scalePart`, `scaleExplosion`, `scaleTool`, or `scaleInstances`
```typescript
import { scaleModel, scalePart, scaleExplosion, scaleTool, scaleInstances } from '@rbxts/scale-model';
```
3. Pass a Model, Part, Explosion, Tool, or array of Instances with a scale factor.  Scale factor > 1 is bigger, < 1 is smaller
```typescript
scaleModel(myModel, 1.5);   // All descendants of myModel to 150% size

scalePart(myPart, new Vector3(0.5, 2, 0.5);     // myPart and all descendants to 50% size on XZ and 200% size on Y (tall + skinny)

scaleExplosion(myExplosion, 10);     // myExplosion to 1000% size

scaleTool(myTool, 0.8);     // myTool to 80% size

scaleInstances(myFolder, 0.5, new Vector3(0,0,0));     // all instances in myFolder to 50% size
```

We need this special api for `scaleExplosion` since we need to scale it before it is parented.

## Custom Scaling Center
You can optionally provide a custom center point in the 3rd parameter, instead of using the Model's PrimaryPart's Position, or the Part's Position.

__The scaling of a Model can fail__ if attempted on a Model that doesn't have a PrimaryPart defined, and no custom center is provided.  In that case, a message will be printed in the output.

__The scaling of a Tool can fail__ if attempted on a Tool that doesn't have a Handle defined, and no custom center is provided.  In that case, a message will be printed in the output.

### Did I miss your favorite Descendant?

[Pull Requests](https://github.com/FirstVertex/rbxts-scale-model/pulls) are welcome if there's something I missed.  Or, [open an Issue](https://github.com/FirstVertex/rbxts-scale-model/issues).

## Command-line usage
The compiled modulescript is available in the [Roblox Library with asset id 8238368335](https://www.roblox.com/library/8238368335/rbxts-scale-model)
Open the Command Bar in Roblox studio and require the modulescript to use it
```
require(8238368335).scaleModel(game.Workspace.TestModel, 4, Enum.NormalId.Bottom)
```

### Roblox-TS

Part of the ever-growing [Roblox-TS](https://roblox-ts.com/) community.

### Roblox

Friend me on Roblox, my Avatar is [FirstVertex](https://www.roblox.com/users/2031724732/profile).

## :v: