/**
 * Scale a Model and all descendants uniformly
 * @param model The Model to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Model's PrimaryPart's Position
 */
export function scaleModel(model: Model, scale: number, center?: Vector3 | Enum.NormalId) {
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
	scaleInstances(model.GetDescendants(), scale, origin);
}

/**
 * Scale a Part and all descendants uniformly
 * @param part The Part to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Part's Position
 */
export function scalePart(part: BasePart, scale: number, center?: Vector3 | Enum.NormalId) {
	if (scale === 1) {
		return;
	}
	const origin = _centerToOrigin(center, part.Size, part.Position);
	_scaleBasePart(part, scale, origin);
	scaleInstances(part.GetDescendants(), scale, origin);
}

/**
 * Scale a Vector uniformly
 * @param vector The Vector to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: position not considered
 */
export function scaleVector(vector: Vector3, scale: number, center?: Vector3) {
	if (scale === 1) {
		return;
	}
	if (center) {
		return center.Lerp(vector, scale);
	} else {
		return vector.mul(scale);
	}
}

/**
 * Scale an Explosion uniformly
 * @param explosion The Explosion to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 */
export function scaleExplosion(explosion: Explosion, scale: number) {
	if (scale === 1) {
		return;
	}
	explosion.Position = explosion.Position.mul(scale);
	explosion.BlastPressure *= scale;
	explosion.BlastRadius *= scale;
}

/**
 * Scale a Tool uniformly
 * @param tool The Tool to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Tool's Handle's Position
 */
export function scaleTool(tool: Tool, scale: number, center?: Vector3 | Enum.NormalId) {
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
	scaleInstances(tool.GetDescendants(), scale, origin);
}

/**
 * Scale an array of Instances uniformly
 * @param explosion The Instances to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 */
export function scaleInstances(instances: Instance[], scale: number, origin: Vector3) {
	if (scale === 1) {
		return;
	}
	for (const instance of instances) {
		if (instance.IsA("BasePart")) {
			_scaleBasePart(instance, scale, origin);
		} else if (instance.IsA("Model")) {
			scaleModel(instance, scale, origin);
		} else if (instance.IsA("Attachment")) {
			_scaleAttachment(instance, scale, origin);
		} else if (instance.IsA("SpecialMesh")) {
			_scaleMesh(instance, scale, origin);
		} else if (instance.IsA("Fire")) {
			_scaleFire(instance, scale, origin);
		} else if (instance.IsA("Explosion")) {
			scaleExplosion(instance, scale);
		} else if (instance.IsA("ParticleEmitter")) {
			_scaleParticle(instance, scale);
		}
	}
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

function _scaleBasePart(part: BasePart, scale: number, origin: Vector3) {
	const angle = part.CFrame.sub(part.Position);
	const pos = origin.Lerp(part.Position, scale);
	part.CFrame = new CFrame(pos).mul(angle);
	part.Size = part.Size.mul(scale);
}

function _scaleAttachment(attachment: Attachment, scale: number, _origin: Vector3) {
	const parent = attachment.Parent;
	if (parent && parent.IsA("BasePart")) {
		attachment.WorldPosition = parent.Position.Lerp(attachment.WorldPosition, scale);
	}
}

function _scaleMesh(mesh: SpecialMesh, scale: number, _origin: Vector3) {
	mesh.Scale = mesh.Scale.mul(scale);
}

function _scaleFire(fire: Fire, scale: number, _origin: Vector3) {
	fire.Size = math.floor(fire.Size * scale);
}

function _scaleParticle(particle: ParticleEmitter, scale: number) {
	particle.Size = _scaleNumberSequence(particle.Size, scale);
}

function _scaleNumberSequence(sequence: NumberSequence, scale: number): NumberSequence {
	return new NumberSequence(
		sequence.Keypoints.map((kp) => new NumberSequenceKeypoint(kp.Time, kp.Value * scale, kp.Envelope * scale)),
	);
}
