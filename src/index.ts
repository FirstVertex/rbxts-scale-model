/**
 * Scale a Model and all descendants uniformly
 * @param model The Model to scale
 * @param scale The amount to scale.  > 1 is bigger, < 1 is smaller
 * @param center (Optional) The point about which to scale.  Default: the Model's PrimaryPart's Position
 */
export function scaleModel(model: Model, scale: number, center?: Vector3) {
	if (scale === 1) {
		return;
	}
	let origin = center;
	if (!origin) {
		const pPart = model.PrimaryPart;
		origin = pPart?.Position;
		if (!pPart || !origin) {
			print("Unable to scale model, no PrimaryPart has been defined, nor center provided");
			return;
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
export function scalePart(part: BasePart, scale: number, center?: Vector3) {
	if (scale === 1) {
		return;
	}
	const origin = center || part.Position;
	_scaleBasePart(part, scale, origin);
	_scaleDescendants(part.GetDescendants(), scale, origin);
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
			_scaleExplosion(descendant, scale);
		} else if (descendant.IsA("ParticleEmitter")) {
			_scaleParticle(descendant, scale);
		}
	}
}

function _scaleBasePart(part: BasePart, scale: number, origin: Vector3) {
	part.Position = origin.Lerp(part.Position, scale);
	part.Size = part.Size.mul(scale);
}

function _scaleAttachment(attachment: Attachment, scale: number, origin: Vector3) {
	const parent = attachment.Parent;
	if (parent && parent.IsA("BasePart")) {
		attachment.WorldPosition = parent.Position.Lerp(attachment.WorldPosition, scale);
	}
}

function _scaleMesh(mesh: SpecialMesh, scale: number, origin: Vector3) {
	mesh.Scale = mesh.Scale.mul(scale);
}

function _scaleFire(fire: Fire, scale: number, origin: Vector3) {
	fire.Size = math.floor(fire.Size * scale);
}

function _scaleExplosion(explosion: Explosion, scale: number) {
	explosion.BlastPressure *= scale;
	explosion.BlastRadius *= scale;
}

function _scaleParticle(particle: ParticleEmitter, scale: number) {
	particle.Size = _scaleNumberSequence(particle.Size, scale);
}

function _scaleNumberSequence(sequence: NumberSequence, scale: number): NumberSequence {
	return new NumberSequence(
		sequence.Keypoints.map((kp) => new NumberSequenceKeypoint(kp.Time, kp.Value * scale, kp.Envelope * scale)),
	);
}
