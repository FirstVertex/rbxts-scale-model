/**
 * Scale a Model and all descendants uniformly
 * @param model The Model to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Model's PrimaryPart's Position
 */
export function scaleModel(model: Model, scale: number, center?: Vector3 | Enum.NormalId) {
	let origin: Vector3;
	if (typeIs(center, "Vector3")) {
		origin = center;
	} else {
		const pPart = model.PrimaryPart;
		if (!pPart) {
			print("Unable to scale model, no PrimaryPart has been defined");
			return;
		}
		if (center) {
			origin = _minSide(model.GetExtentsSize(), pPart.Position, center);
		} else {
			if (scale === 1) {
				return;
			}
			origin = pPart.Position;
		}
	}
	_scaleDescendants(model.GetDescendants(), scale, origin);
}

/**
 * Scale a Part and all descendants uniformly
 * @param part The Part to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Part's Position
 */
export function scalePart(part: BasePart, scale: number, center?: Vector3 | Enum.NormalId) {
	let origin: Vector3;
	if (typeIs(center, "Vector3")) {
		origin = center;
	} else {
		if (center) {
			origin = _minSide(part.Size, part.Position, center);
		} else {
			if (scale === 1) {
				return;
			}
			origin = part.Position;
		}
	}
	_scaleBasePart(part, scale, origin);
	_scaleDescendants(part.GetDescendants(), scale, origin);
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

function _scaleDescendants(descendants: Instance[], scale: number, origin: Vector3) {
	for (const descendant of descendants) {
		if (descendant.IsA("BasePart")) {
			_scaleBasePart(descendant, scale, origin);
		} else if (descendant.IsA("Attachment")) {
			_scaleAttachment(descendant, scale, origin);
		} else if (descendant.IsA("SpecialMesh")) {
			_scaleMesh(descendant, scale, origin);
		} else if (descendant.IsA("Fire")) {
			_scaleFire(descendant, scale, origin);
		} else if (descendant.IsA("Explosion")) {
			scaleExplosion(descendant, scale);
		} else if (descendant.IsA("ParticleEmitter")) {
			_scaleParticle(descendant, scale);
		}
	}
}

function _scaleBasePart(part: BasePart, scale: number, origin: Vector3) {
	part.Position = origin.Lerp(part.Position, scale);
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
