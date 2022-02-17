/**
 * @rbxts/scale-model
 * 
 * USAGE:
 * import { scaleModel } '@rbxts/scale-model';
 * 
 * scaleModel(game.Workspace.MyModel, 7, Enum.NormalId.Bottom)
 * 
 */

function averageNumbers(numbers: number[]) {
	const count = numbers.size();
	if (count === 0) {
		return 0;
	}
	return numbers.reduce((acc: number, cv: number) => (acc + cv), 0) / count;
}

/**
 * A type used to represent the parameters for scaling
 */
export type ScaleInputType = number | Vector2 | Vector3 | ScaleSpecifier

/**
 * A class used to represent the parameters for scaling
 */
export class ScaleSpecifier {
	constructor(private readonly _scaleInput: ScaleInputType) {
		const inputType = typeOf(_scaleInput);
		this.isNumber = inputType === 'number';
		this.isVector2 = inputType === 'Vector2';
		this.isVector3 = inputType === 'Vector3';
		this.isScaleSpec = !(this.isNumber || this.isVector2 || this.isVector3);

		if (this.isNumber) {
			const scaleNumber = this._scaleInput as number;
			this.asNumber = scaleNumber;
			this.asVector2 = new Vector2(scaleNumber, scaleNumber);
			this.asVector3 = new Vector3(scaleNumber, scaleNumber, scaleNumber);
			this.asScaleSpec = this;
		} else if (this.isVector2) {
			const scaleVec2 = this._scaleInput as Vector2;
			this.asNumber = averageNumbers([scaleVec2.X, scaleVec2.Y]);
			this.asVector2 = scaleVec2;
			this.asVector3 = new Vector3(scaleVec2.X, scaleVec2.Y, this.asNumber);
			this.asScaleSpec = this;
		} else if (this.isVector3) {
			const scaleVec3 = this._scaleInput as Vector3;
			this.asNumber = averageNumbers([scaleVec3.X, scaleVec3.Y, scaleVec3.Z]);
			this.asVector2 = new Vector2(scaleVec3.X, scaleVec3.Y);
			this.asVector3 = scaleVec3;
			this.asScaleSpec = this;
		} else if (this.isScaleSpec) {
			const scaleSpec = this._scaleInput as ScaleSpecifier;
			this.asNumber = scaleSpec.asNumber;
			this.asVector2 = scaleSpec.asVector2;
			this.asVector3 = scaleSpec.asVector3;
			this.asScaleSpec = scaleSpec;
		}
	}

	readonly isNumber: boolean;
	readonly isVector2: boolean;
	readonly isVector3: boolean;
	readonly isScaleSpec: boolean;

	readonly asNumber!: number;
	readonly asVector2!: Vector2;
	readonly asVector3!: Vector3;
	readonly asScaleSpec!: ScaleSpecifier;
}

/**
 * Scale a Model and all descendants uniformly
 * @param model The Model to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Model's PrimaryPart's Position
 */
export function scaleModel(model: Model, scale: ScaleInputType, center?: Vector3 | Enum.NormalId): void {
	if (scale === 1) {
		return;
	}
	let origin: Vector3;
	if (center && typeIs(center, 'Vector3')) {
		origin = center;
	} else {
		const pPart = model.PrimaryPart;
		if (!pPart) {
			print("Unable to scale model, no center nor PrimaryPart has been defined");
			return;
		}
		origin = _centerToOrigin(center, model.GetExtentsSize(), pPart.Position);
	}
	scaleDescendants(model, scale, origin);
}

/**
 * Scale a Part and all descendants uniformly
 * @param part The Part to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Part's Position
 */
export function scalePart(part: BasePart, scale: ScaleInputType, center?: Vector3 | Enum.NormalId): void {
	if (scale === 1) {
		return;
	}
	const origin = _centerToOrigin(center, part.Size, part.Position);
	_scaleBasePart(part, scale, origin);
	scaleDescendants(part, scale, origin);
}

function lerpVector(vector: Vector3, center: Vector3, sspec: ScaleSpecifier): Vector3 {
	const delta = vector.sub(center);

	// const {X, Y, Z} = vector;
	const centerX = center.X;
	const centerY = center.Y;
	const centerZ = center.Z;

	const scaleVec = sspec.asVector3;
	const scaleX = scaleVec.X;
	const scaleY = scaleVec.Y;
	const scaleZ = scaleVec.Z;

	return new Vector3(
		centerX + (delta.X * scaleX),
		centerY + (delta.Y * scaleY),
		centerZ + (delta.Z * scaleZ)
	);
}

/**
 * Scale a Vector uniformly
 * @param vector The Vector to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: position not considered
 */
export function scaleVector(vector: Vector3, scale: ScaleInputType, center?: Vector3): Vector3 {
	if (scale === 1) {
		return vector;
	}
	const sspec = new ScaleSpecifier(scale);
	if (center) {
		return lerpVector(vector, center, sspec);
	} else {
		return sspec.isVector3 ? 
			vector.mul(sspec.asVector3) :
			vector.mul(sspec.asNumber);
	}
}

/**
 * Scale an Explosion uniformly
 * @param explosion The Explosion to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 */
export function scaleExplosion(explosion: Explosion, scale: ScaleInputType): void {
	if (scale === 1) {
		return;
	}
	const sspec = new ScaleSpecifier(scale);
	explosion.Position = sspec.isVector3 ? explosion.Position.mul(sspec.asVector3) : explosion.Position.mul(sspec.asNumber);
	explosion.BlastPressure *= sspec.asNumber;
	explosion.BlastRadius *= sspec.asNumber;
}

/**
 * Scale a Tool uniformly
 * @param tool The Tool to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Tool's Handle's Position
 */
export function scaleTool(tool: Tool, scale: ScaleInputType, center?: Vector3 | Enum.NormalId): void {
	if (scale === 1) {
		return;
	}	
	let origin: Vector3;
	if (center && typeIs(center, 'Vector3')) {
		origin = center;
	} else {
		const handle = tool.FindFirstChild('Handle') as BasePart;
		if (!handle) {
			print("Unable to scale tool, no center nor Handle has been defined");
			return;
		}
		origin = _centerToOrigin(center, handle.Size, handle.Position);
	}
	scaleDescendants(tool, scale, origin);
}

function disableWelds(container: Instance): Map<WeldConstraint, boolean> {
	const welds = new Map<WeldConstraint, boolean>();
	const desc = container.GetDescendants();
	for (const instance of desc) {
		if (instance.IsA("WeldConstraint")) {
			welds.set(instance, instance.Enabled);
			instance.Enabled = false;
		}
	}
	return welds;
}

function enableWelds(welds: Map<WeldConstraint, boolean>) {
	welds.forEach((value: boolean, wc: WeldConstraint) => {
		wc.Enabled = value;
	});
}

/**
 * Scale an array of Instances uniformly
 * @param explosion The Instances to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 */
export function scaleDescendants(container: Instance, scale: ScaleInputType, origin: Vector3, recur: boolean = false): void {
	if (scale === 1) {
		return;
	}
	const welds = recur ? undefined : disableWelds(container);
	const instances = container.GetChildren();
	for (const instance of instances) {
		let scaledChildren = false;
		if (instance.IsA("BasePart")) {
			scalePart(instance, scale, origin);
            scaledChildren = true;
		} else if (instance.IsA("Model")) {
			scaleModel(instance, scale, origin);
			scaledChildren = true;
		} else if (instance.IsA("Attachment")) {
			_scaleAttachment(instance, scale, origin);
		} else if (instance.IsA("Tool")) {
			scaleTool(instance, scale, origin);
			scaledChildren = true;
		} else if (instance.IsA("SpecialMesh")) {
			scaleMesh(instance, scale, origin);
		} else if (instance.IsA("Fire")) {
			scaleFire(instance, scale, origin);
		} else if (instance.IsA("Explosion")) {
			scaleExplosion(instance, scale);
		} else if (instance.IsA("ParticleEmitter")) {
			scaleParticle(instance, scale);
		} else if (instance.IsA("Texture")) {
			scaleTexture(instance, scale, origin);
		}
		if (!scaledChildren) {
			scaleDescendants(instance, scale, origin, true);
		}
	}
	if (welds) {
		enableWelds(welds);
	}
}

export function scaleTexture(texture: Texture, scale: ScaleInputType, origin: Vector3) {
	const sspecV2 = new ScaleSpecifier(scale).asVector2;
	texture.OffsetStudsU *= sspecV2.X;	
	texture.OffsetStudsV *= sspecV2.Y;
	texture.StudsPerTileU *= sspecV2.X;
	texture.StudsPerTileV *= sspecV2.Y;
}

export function scaleMesh(mesh: SpecialMesh, scale: ScaleInputType, _origin: Vector3): void {
	mesh.Scale = mesh.Scale.mul(new ScaleSpecifier(scale).asNumber);
}

export function scaleFire(fire: Fire, scale: ScaleInputType, _origin: Vector3): void {
	fire.Size = math.floor(fire.Size * new ScaleSpecifier(scale).asNumber);
}

export function scaleParticle(particle: ParticleEmitter, scale: ScaleInputType): void {
	particle.Size = scaleNumberSequence(particle.Size, scale);
}

export function scaleNumberSequence(sequence: NumberSequence, scale: ScaleInputType): NumberSequence {
	const scaleNum = new ScaleSpecifier(scale).asNumber;
	return new NumberSequence(
		sequence.Keypoints.map((kp) => new NumberSequenceKeypoint(kp.Time, kp.Value * scaleNum, kp.Envelope * scaleNum)),
	);
}

export function scalePointLight(light: PointLight, scale: ScaleInputType): void {
	const scaleNum = new ScaleSpecifier(scale).asNumber;
    light.Range *= scaleNum;
}

function _centerToOrigin(center: Vector3 | Enum.NormalId | undefined, size: Vector3, position: Vector3): Vector3 {
	let origin: Vector3;
	if (typeIs(center, "Vector3")) {
		origin = center;
	} else {
		if (center) {
			origin = _minSide(size, position, center);
		} else {
			origin = position;
		}
	}
	return origin;
}

function _minSide(size: Vector3, position: Vector3, side?: Enum.NormalId): Vector3 {
	const halfSize = size.mul(0.5);
	switch (side) {
		case Enum.NormalId.Front: {
			return new Vector3(position.X, position.Y, position.Z - halfSize.Z);
		}
		case Enum.NormalId.Back: {
			return new Vector3(position.X, position.Y, position.Z + halfSize.Z);
		}
		case Enum.NormalId.Right: {
			return new Vector3(position.X + halfSize.X, position.Y, position.Z);
		}
		case Enum.NormalId.Left: {
			return new Vector3(position.X - halfSize.X, position.Y, position.Z);
		}
		case Enum.NormalId.Top: {
			return new Vector3(position.X, position.Y + halfSize.Y, position.Z);
		}
		case Enum.NormalId.Bottom: {
			return new Vector3(position.X, position.Y - halfSize.Y, position.Z);
		}
	}
	return position;
}

function _scaleBasePart(part: BasePart, scale: ScaleInputType, origin: Vector3) {
	const angle = part.CFrame.sub(part.Position);

	const sspec = new ScaleSpecifier(scale);
	const pos = lerpVector(part.Position, origin, sspec);
	part.Size = sspec.isVector3 ? part.Size.mul(sspec.asVector3) :
		part.Size.mul(sspec.asNumber);
	part.CFrame = new CFrame(pos).mul(angle);
}

function _scaleAttachment(attachment: Attachment, scale: ScaleInputType, _origin: Vector3) {
	const parent = attachment.FindFirstAncestorWhichIsA('BasePart');
	if (parent) {
		attachment.WorldPosition = lerpVector(attachment.WorldPosition, parent.Position, new ScaleSpecifier(scale));
	}
}
