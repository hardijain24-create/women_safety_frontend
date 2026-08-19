package com.guardian.band

import android.app.PendingIntent
import android.app.widget.AppWidgetManager
import android.app.widget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class WidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_layout)

        // Deep link intent to trigger React Native SOS sequence
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("guardianband://sos-trigger")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            setPackage(context.packageName)
        }

        val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        val pendingIntent = PendingIntent.getActivity(context, 0, intent, flags)

        views.setOnClickPendingIntent(R.id.widget_sos_button, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
