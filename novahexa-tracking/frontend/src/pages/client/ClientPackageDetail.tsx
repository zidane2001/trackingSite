import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, FileText, Download, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { ParcelMap } from '../../components/ParcelMap';
import { TrackingQR } from '../../components/TrackingQR';
import { MessagingPanel } from '../../components/MessagingPanel';
import { PhotoGallery } from '../../components/PhotoGallery';
import { packagesApi, pdfApi } from '../../lib/api';
import type { PackageItem } from '../../types';

export function ClientPackageDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [pkg, setPkg] = useState<PackageItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    packagesApi
      .get(id)
      .then(setPkg)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-slate-400">{t('common.loading')}</div>
      </DashboardLayout>
    );
  }

  if (!pkg) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">{t('client.detail_not_found')}</p>
          <Link to="/client" className="text-yellow-500 font-semibold hover:underline">
            {t('client.detail_back_dashboard')}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <Link to="/client" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('client.detail_back')}
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                <Package className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{pkg.name}</h1>
                <p className="text-sm text-slate-400 font-mono mt-0.5">{pkg.trackingNumber}</p>
              </div>
            </div>
            <StatusBadge status={pkg.status} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <ParcelMap pkg={pkg} height="400px" showPosition={true} />
          </div>

          <div className="space-y-4">
            <TrackingQR
              trackingNumber={pkg.trackingNumber}
              name={pkg.name}
              origin={pkg.originAddress}
              destination={pkg.destinationAddress}
              size={160}
              showLabel={true}
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">{t('client.detail_documents')}</h3>
              <div className="space-y-2">
                <button
                  onClick={() => pdfApi.downloadQuote(pkg.trackingNumber)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                >
                  <FileText className="w-4 h-4" />
                  {t('client.detail_download_quote')}
                </button>
                <button
                  onClick={() => pdfApi.downloadInvoice(pkg.trackingNumber)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  {t('client.detail_download_invoice')}
                </button>
                <button
                  onClick={() => pdfApi.downloadLabel(pkg.trackingNumber)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors font-medium"
                >
                  <Tag className="w-4 h-4" />
                  {t('client.detail_download_label')}
                </button>
              </div>
            </div>

            <PhotoGallery imageUrls={pkg.imageUrls ?? []} />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">{t('client.detail_route')}</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">{t('client.detail_departure')}</p>
                    <p className="text-sm text-slate-700">{pkg.originAddress}</p>
                  </div>
                </div>
                <div className="ml-1 border-l-2 border-dashed border-slate-200 h-4" />
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">{t('client.detail_arrival')}</p>
                    <p className="text-sm text-slate-700">{pkg.destinationAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">{t('client.detail_info')}</h3>
              <div className="space-y-2 text-sm">
                {pkg.senderName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('client.detail_sender_name')}</span>
                    <span className="font-medium text-slate-700">{pkg.senderName}</span>
                  </div>
                )}
                {pkg.senderEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('client.detail_sender_email')}</span>
                    <span className="font-medium text-slate-700">{pkg.senderEmail}</span>
                  </div>
                )}
                {pkg.senderPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('client.detail_sender_phone')}</span>
                    <span className="font-medium text-slate-700">{pkg.senderPhone}</span>
                  </div>
                )}
                {pkg.transportMode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('client.detail_transport')}</span>
                    <span className="font-medium text-slate-700">{pkg.transportMode}</span>
                  </div>
                )}
                {pkg.weightKg && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('client.detail_weight')}</span>
                    <span className="font-medium text-slate-700">{pkg.weightKg} kg</span>
                  </div>
                )}
                {pkg.estimatedDuration && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('client.detail_estimated_duration')}</span>
                    <span className="font-medium text-slate-700">{pkg.estimatedDuration}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('client.detail_created')}</span>
                  <span className="font-medium text-slate-700">
                    {new Date(pkg.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {pkg.trackingEvents && pkg.trackingEvents.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t('client.detail_history')}
                </h3>
                <div className="space-y-3">
                  {pkg.trackingEvents.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 shrink-0" />
                      <div>
                        <p className="text-sm text-slate-700">{ev.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(ev.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <MessagingPanel
              parcelId={pkg.id}
              packageName={pkg.name}
              context="client"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
