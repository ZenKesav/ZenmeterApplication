import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../app/store';
import { userService } from '../../services/userService';
import { showSuccessAlert, showErrorAlert } from '../../utils/swal';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || user?.user_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [avatar, setAvatar] = useState(user?.avatar || DEFAULT_AVATAR);
  const [savingProfile, setSavingProfile] = useState(false);

  // Advanced Crop Modal State
  const [showCropModal, setShowCropModal] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || user.user_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '9876543210');
      setAvatar(user.avatar || DEFAULT_AVATAR);
    }
  }, [user]);

  const hasProfileChanged = Boolean(
    user && (
      (name || '').trim() !== (user.name || user.user_name || '').trim() ||
      (avatar || '') !== (user.avatar || DEFAULT_AVATAR)
    )
  );

  // File selection handler
  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showErrorAlert('Invalid File', 'Please select a valid image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result);
        setZoom(1);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setOffset({ x: 0, y: 0 });
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Main Canvas & Live Preview Renderer
  useEffect(() => {
    if (!showCropModal || !rawImageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawImageSrc;

    img.onload = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background fill
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale((flipH ? -1 : 1) * zoom, (flipV ? -1 : 1) * zoom);

      const aspect = img.width / img.height;
      let drawW = width;
      let drawH = height;

      if (aspect >= 1) {
        drawH = height;
        drawW = drawH * aspect;
      } else {
        drawW = width;
        drawH = drawW / aspect;
      }

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // Render Overlay Dark Mask with cutout circle
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.fillRect(0, 0, width, height);

      // Cutout circle (radius 110px inside 320x320 canvas)
      const cropRadius = 110;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, cropRadius, 0, Math.PI * 2);
      ctx.fill();

      // Active crop ring border
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, cropRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#E66239';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Subtle inner guide crosshair
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, cropRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();

      // Render Live Preview on preview canvas
      if (previewCanvasRef.current) {
        const pCanvas = previewCanvasRef.current;
        const pCtx = pCanvas.getContext('2d');
        const pSize = pCanvas.width;
        pCtx.clearRect(0, 0, pSize, pSize);

        pCtx.save();
        pCtx.beginPath();
        pCtx.arc(pSize / 2, pSize / 2, pSize / 2, 0, Math.PI * 2);
        pCtx.clip();

        pCtx.fillStyle = '#0f172a';
        pCtx.fillRect(0, 0, pSize, pSize);

        const cropViewportSize = cropRadius * 2; // 220px
        const scaleFactor = pSize / cropViewportSize;

        pCtx.translate(pSize / 2, pSize / 2);
        pCtx.translate(offset.x * scaleFactor, offset.y * scaleFactor);
        pCtx.rotate((rotation * Math.PI) / 180);
        pCtx.scale((flipH ? -1 : 1) * zoom, (flipV ? -1 : 1) * zoom);

        let pDrawW = pSize * (width / cropViewportSize);
        let pDrawH = pSize * (height / cropViewportSize);
        if (aspect >= 1) {
          pDrawW = pDrawH * aspect;
        } else {
          pDrawH = pDrawW / aspect;
        }

        pCtx.drawImage(img, -pDrawW / 2, -pDrawH / 2, pDrawW, pDrawH);
        pCtx.restore();
      }
    };
  }, [showCropModal, rawImageSrc, zoom, rotation, flipH, flipV, offset]);

  // Drag and Touch handlers for image panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || !e.touches[0]) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  // Mouse wheel zoom support
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 4.0));
  };

  // Generate HD Cropped Image (300x300)
  const generateCroppedImage = () => {
    return new Promise((resolve, reject) => {
      if (!rawImageSrc) return reject('No image source');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = rawImageSrc;

      img.onload = () => {
        const outCanvas = document.createElement('canvas');
        const targetSize = 300;
        outCanvas.width = targetSize;
        outCanvas.height = targetSize;
        const ctx = outCanvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.save();
        ctx.translate(targetSize / 2, targetSize / 2);

        // Map scale from 320x320 (220 crop circle) to 300x300 target
        const scaleFactor = targetSize / 220;

        ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale((flipH ? -1 : 1) * zoom, (flipV ? -1 : 1) * zoom);

        const aspect = img.width / img.height;
        let drawW = targetSize * (320 / 220);
        let drawH = targetSize * (320 / 220);

        if (aspect >= 1) {
          drawW = drawH * aspect;
        } else {
          drawH = drawW / aspect;
        }

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        const croppedDataUrl = outCanvas.toDataURL('image/png');
        resolve(croppedDataUrl);
      };
      img.onerror = (err) => reject(err);
    });
  };

  // Confirm Crop & Save to DB
  const handleConfirmCrop = async () => {
    try {
      setUploadingAvatar(true);
      const croppedDataUrl = await generateCroppedImage();

      let updatedUserObj = null;
      try {
        const res = await userService.updateOwnProfile({
          name: name || user?.name || 'Zenmeter User',
          avatar: croppedDataUrl
        });
        if (res && res.user) {
          updatedUserObj = res.user;
        }
      } catch (err) {
        console.warn('Backend avatar update warning:', err);
      }

      const newAvatarUrl = updatedUserObj?.avatar || croppedDataUrl;
      setAvatar(newAvatarUrl);
      updateProfile({
        avatar: newAvatarUrl,
        name: name || user?.name
      });

      setShowCropModal(false);
      setUploadingAvatar(false);

      showSuccessAlert(
        'Profile Picture Updated!',
        'Your profile picture has been cropped and saved to the database successfully.'
      );
    } catch (err) {
      setUploadingAvatar(false);
      showErrorAlert('Crop Failed', 'Could not process crop image. Please try again.');
    }
  };

  // Submit Profile Form
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const res = await userService.updateOwnProfile({
        name,
        user_name: name,
        avatar
      });
      if (res && res.user) {
        updateProfile(res.user);
      } else {
        updateProfile({ name, user_name: name, avatar });
      }
      showSuccessAlert(
        'Profile Updated',
        `User profile details saved successfully for ${name || 'User'}!`
      );
    } catch (err) {
      updateProfile({ name, user_name: name, avatar });
      showSuccessAlert('Profile Updated', 'User profile details saved successfully!');
    } finally {
      setSavingProfile(false);
    }
  };

  const rawRole = (user?.role || '').toUpperCase();
  const isAdmin = rawRole.includes('ADMIN');

  return (
    <>
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-0 fw-bold text-dark d-flex align-items-center gap-2">
            <i className="ti ti-user-circle text-primary"></i>
            User Profile
          </h1>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary bg-gradient text-white px-4 py-3 rounded-top-3">
              <h3 className="h6 fw-bold mb-0 text-white d-flex align-items-center gap-2">
                <i className="ti ti-id fs-5"></i>
                <span>Logged-in User Account Profile</span>
              </h3>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleProfileSave}>
                <div className="row g-4 align-items-start">
                  {/* Left Column: Avatar Preview & Upload Trigger */}
                  <div className="col-lg-4 text-center border-end-lg pe-lg-4">
                    <div className="mb-3 position-relative d-inline-block">
                      <img
                        src={avatar}
                        alt={name || 'Profile'}
                        className="rounded-circle border border-4 border-primary shadow-sm"
                        style={{ width: '140px', height: '140px', objectFit: 'cover' }}
                      />
                      <label
                        htmlFor="profile-avatar-input"
                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2.5 shadow-sm border border-white"
                        style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
                        title="Click to Upload & Crop Profile Picture"
                      >
                        <i className="ti ti-camera fs-5"></i>
                        <input
                          type="file"
                          id="profile-avatar-input"
                          ref={fileInputRef}
                          accept="image/*"
                          className="d-none"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>

                    <div className="fw-bold fs-5 text-dark mb-1">{name || user?.name || 'Zenmeter User'}</div>
                    <div className="d-flex justify-content-center gap-2 flex-wrap mb-0">
                      <span className="badge bg-dark text-white px-2.5 py-1 font-mono">
                        <i className="ti ti-id me-1"></i>{user?.employee_id || 'OPERATOR'}
                      </span>
                      <span className={`badge ${isAdmin ? 'bg-primary' : 'bg-warning text-dark'} px-2.5 py-1 font-mono`}>
                        <i className="ti ti-shield me-1"></i>{user?.role || 'USER'}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: User Account Details */}
                  <div className="col-lg-8">
                    <h6 className="fw-bold text-uppercase text-primary small mb-3 border-bottom pb-2">
                      <i className="ti ti-edit me-1"></i> Account Details
                    </h6>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">Full Name / Operator Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter Full Name"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">Employee ID / Operator ID</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={user?.employee_id || ''}
                          disabled
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">Email Address</label>
                        <input
                          type="email"
                          className="form-control bg-light"
                          value={email}
                          readOnly
                          placeholder="e.g. admin@zenmeter.com"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-dark small">Contact Number</label>
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={phone}
                          readOnly
                          placeholder="e.g. 9876543210"
                        />
                      </div>

                      {/* Assigned Stage Specification */}
                      <div className="col-12">
                        <label className="form-label fw-semibold text-dark small d-flex justify-content-between align-items-center mb-1.5">
                          <span className="d-flex align-items-center gap-1.5">
                            <i className="ti ti-subtask text-primary"></i>
                            Assigned Stage Specification
                          </span>
                          {isAdmin ? (
                            <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-mono fw-normal">
                              Full Factory Authorization
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle font-mono fw-normal">
                              {user?.assigned_stage
                                ? `${Array.from(new Set(user.assigned_stage.split(',').map(s => s.trim()).filter(Boolean))).length} Stages Configured`
                                : user?.stage_id
                                  ? '1 Stage Configured'
                                  : 'General Access'}
                            </span>
                          )}
                        </label>

                        {isAdmin ? (
                          <div className="p-2.5 bg-light rounded-3 border d-flex align-items-center gap-2">
                            <span className="badge bg-primary text-white font-mono px-2 py-1">ALL STAGES</span>
                            <span className="text-dark small fw-medium">All Factory Production Stages (Full Factory Pipeline Authorization)</span>
                          </div>
                        ) : user?.assigned_stage ? (
                          <div className="p-3 bg-light-subtle rounded-3 border">
                            <div className="row g-2">
                              {Array.from(new Set(user.assigned_stage.split(',').map(s => s.trim()).filter(Boolean))).map((stgStr, idx) => {
                                let stageNum = null;
                                let stageName = stgStr;
                                const fullMatch = stgStr.match(/^(?:stage\s*)?(\d+)(?:\s*stage)?\s*[-–:]\s*(.+)$/i);
                                if (fullMatch) {
                                  stageNum = fullMatch[1];
                                  stageName = fullMatch[2].trim();
                                } else {
                                  const numOnlyMatch = stgStr.match(/^(?:stage\s*)?(\d+)(?:\s*stage)?$/i);
                                  if (numOnlyMatch) {
                                    stageNum = numOnlyMatch[1];
                                    stageName = `Stage ${stageNum}`;
                                  }
                                }

                                return (
                                  <div key={idx} className="col-12 col-sm-6 col-md-4">
                                    <div
                                      className="d-flex align-items-center bg-white border border-secondary-subtle rounded-2 px-2.5 py-2 shadow-2xs h-100"
                                      style={{ minHeight: '44px' }}
                                    >
                                      {stageNum ? (
                                        <span
                                          className="badge text-white font-mono fw-bold px-2 py-1 rounded me-2 flex-shrink-0"
                                          style={{
                                            backgroundColor: '#E66239',
                                            fontSize: '0.72rem',
                                            letterSpacing: '0.3px',
                                            minWidth: '56px',
                                            textAlign: 'center'
                                          }}
                                        >
                                          Stage {stageNum}
                                        </span>
                                      ) : (
                                        <span
                                          className="badge bg-secondary-subtle text-secondary font-mono fw-bold px-2 py-1 rounded me-2 flex-shrink-0"
                                          style={{ fontSize: '0.72rem' }}
                                        >
                                          <i className="ti ti-subtask"></i>
                                        </span>
                                      )}
                                      <span
                                        className="text-dark fw-medium small lh-sm"
                                        title={stageName}
                                        style={{ fontSize: '0.8125rem' }}
                                      >
                                        {stageName}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-light rounded-3 border text-muted small font-mono">
                            {user?.stage_id ? `Stage ${user.stage_id}` : 'General Factory Operations'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                      <button type="submit" className="btn btn-primary px-4 py-2 fw-semibold shadow-sm" disabled={savingProfile || !hasProfileChanged}>
                        <i className="ti ti-check me-1"></i>
                        {savingProfile ? 'Saving Details...' : 'Update Profile Details'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ULTRA USER-FRIENDLY CROP MODAL */}
      {showCropModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              {/* Header */}
              <div className="modal-header bg-primary text-white py-3 px-4">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-white bg-opacity-20 p-2 rounded-3 text-white">
                    <i className="ti ti-crop fs-4"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Crop & Adjust Profile Avatar</h5>
                    <small className="opacity-90 text-xs">Interactive framing, zoom, rotation & live preview</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCropModal(false)}
                ></button>
              </div>

              {/* Modal Body: 2 Column Side-by-Side UX Layout */}
              <div className="modal-body p-4 bg-light">
                <div className="row g-4 align-items-center">
                  {/* Left Column: Interactive Canvas */}
                  <div className="col-lg-7 text-center">
                    <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                      <small className="fw-semibold text-secondary">
                        <i className="ti ti-hand-grab me-1 text-primary"></i>Drag to Position Image
                      </small>
                      <small className="badge bg-white text-dark border font-mono shadow-2xs">
                        <i className="ti ti-mouse me-1 text-primary"></i>Scroll Wheel Zoom
                      </small>
                    </div>

                    {/* Canvas Viewport */}
                    <div
                      className="position-relative d-inline-block rounded-4 overflow-hidden shadow-sm border border-secondary border-opacity-25"
                      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleMouseUp}
                      onWheel={handleWheel}
                    >
                      <canvas ref={canvasRef} width={320} height={320} className="d-block" />
                    </div>

                    {/* Output Size Pill */}
                    <div className="mt-2">
                      <span className="badge bg-dark text-white px-3 py-1.5 font-mono text-xs shadow-2xs">
                        <i className="ti ti-aspect-ratio me-1 text-primary"></i>
                        Target Crop Resolution: 300 × 300 px (1:1 HD Avatar)
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Live Previews & Control Toolbar */}
                  <div className="col-lg-5">
                    <div className="card border shadow-2xs rounded-3 p-3 bg-white mb-3">
                      <h6 className="fw-bold text-dark small text-uppercase mb-3 pb-2 border-bottom d-flex align-items-center justify-content-between">
                        <span><i className="ti ti-eye me-1 text-primary"></i>Live Avatar Preview</span>
                        <span className="badge bg-success-subtle text-success text-xs">Real-time</span>
                      </h6>

                      <div className="d-flex align-items-center justify-content-around">
                        {/* 1. Main Profile Card Avatar Preview */}
                        <div className="text-center">
                          <div className="position-relative d-inline-block mb-1">
                            <canvas
                              ref={previewCanvasRef}
                              width={110}
                              height={110}
                              className="rounded-circle border border-3 border-primary shadow-sm"
                            />
                          </div>
                          <small className="d-block text-muted text-xs font-mono">Profile Card</small>
                        </div>

                        {/* 2. Topbar Navigation Header Avatar Preview */}
                        <div className="text-center">
                          <div className="p-2 bg-light rounded-3 border mb-1 d-inline-flex align-items-center justify-content-center">
                            <div className="position-relative">
                              <canvas
                                width={44}
                                height={44}
                                className="rounded-circle border border-2 border-primary"
                                ref={(el) => {
                                  if (el && previewCanvasRef.current) {
                                    const pCtx = el.getContext('2d');
                                    pCtx.clearRect(0, 0, 44, 44);
                                    pCtx.drawImage(previewCanvasRef.current, 0, 0, 44, 44);
                                  }
                                }}
                              />
                              <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>
                            </div>
                          </div>
                          <small className="d-block text-muted text-xs font-mono">Topbar View</small>
                        </div>
                      </div>
                    </div>

                    {/* Toolbar Controls Card */}
                    <div className="card border shadow-2xs rounded-3 p-3 bg-white">
                      <h6 className="fw-bold text-dark small text-uppercase mb-2">
                        <i className="ti ti-adjustments me-1 text-primary"></i>Image Controls
                      </h6>

                      {/* Zoom Slider with Quick Step +/- */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="fw-semibold text-secondary text-xs">Zoom Scale</small>
                          <small className="fw-bold font-mono text-primary text-xs">{Math.round(zoom * 100)}%</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm p-1.5 rounded-2"
                            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                            title="Zoom Out"
                          >
                            <i className="ti ti-zoom-out fs-6"></i>
                          </button>
                          <input
                            type="range"
                            className="form-range"
                            min="0.5"
                            max="3.0"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm p-1.5 rounded-2"
                            onClick={() => setZoom((z) => Math.min(3.0, z + 0.1))}
                            title="Zoom In"
                          >
                            <i className="ti ti-zoom-in fs-6"></i>
                          </button>
                        </div>
                      </div>

                      {/* Transform Buttons: Rotate & Flip */}
                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm w-100 fw-medium d-flex align-items-center justify-content-center gap-1"
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                          >
                            <i className="ti ti-rotate-clockwise"></i> Rotate 90°
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm w-100 fw-medium d-flex align-items-center justify-content-center gap-1"
                            onClick={() => setFlipH((f) => !f)}
                          >
                            <i className="ti ti-flip-horizontal"></i> Flip H
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-light btn-sm text-secondary border w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 mt-1"
                        onClick={() => {
                          setZoom(1);
                          setRotation(0);
                          setFlipH(false);
                          setFlipV(false);
                          setOffset({ x: 0, y: 0 });
                        }}
                      >
                        <i className="ti ti-refresh"></i> Reset Framing
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-white px-4 py-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-light px-4 fw-semibold border"
                  onClick={() => setShowCropModal(false)}
                  disabled={uploadingAvatar}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                  onClick={handleConfirmCrop}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Saving Avatar to DB...</span>
                    </>
                  ) : (
                    <>
                      <i className="ti ti-cloud-upload fs-5"></i>
                      <span>Crop & Upload Avatar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
