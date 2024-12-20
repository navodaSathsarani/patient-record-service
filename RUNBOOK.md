
# Runbook: CI/CD Pipeline for Patient Record Service

## Objective

This runbook provides a comprehensive guide to deploy the Patient Record Service using a CI/CD pipeline with a Blue-Green deployment strategy. It ensures smooth transitions, minimal downtime, and rollback capabilities in case of deployment issues.

---

## Pre-requisites

- A GitHub repository with:
  - CI/CD pipeline configuration.
  - Deployment YAML files:
    - `patient-record-service-green.yaml`
    - `patient-record-service-blue.yaml`
    - `patient-record-service-service.yaml`
- Secrets configured in the GitHub repository:
  - **`GCP_SA_KEY`**: Google Cloud Service Account JSON key.
- A Kubernetes cluster with sufficient resources.
- Google Cloud CLI installed and authenticated.

---

## Deployment Workflow

### Step 1: Trigger the Pipeline

1. Commit and push changes to the `main` branch:
   ```bash
   git add .
   git commit -m "Update CI/CD pipeline"
   git push origin main
   ```
2. Monitor the pipeline execution in the **Actions** tab of the GitHub repository.

---

### Step 2: Build and Push Docker Image

- The pipeline will automatically:
  1. Build the Docker image.
  2. Push the image to Google Container Registry (GCR):
     ```bash
     gcr.io/healthsync-project-445302/patient-record-service:<commit-sha>
     ```

---
### Step 3 : Install Gcloud components
```bash
  gcloud components install gke-gcloud-auth-plugin
```
### Step 4 : Set up Kubernetes Credentials
```bash
    gcloud container clusters get-credentials healthsync-cluster --zone us-east1 --project healthsync-project-445302
```
### Step 5: Deploy Green Deployment and Blue deployment

- The pipeline updates the green deployment with the new image and applies the configuration:
  ```bash

    sed -i "s|<IMAGE>|gcr.io/healthsync-project-445302/patient-record-service:${{ github.sha }}|g" patient-record-service-green.yaml
    kubectl apply -f patient-record-service-green.yaml
    sed -i "s|<IMAGE>|gcr.io/healthsync-project-445302/patient-record-service:${{ github.sha }}|g" patient-record-service-blue.yaml
    kubectl apply -f patient-record-service-blue.yaml
    kubectl apply -f patient-record-service-green.yaml
  ```

---

### Step 6: Validate Green Deployment

- Verify the rollout of the green deployment:
  ```bash
  kubectl rollout status deployment/patient-record-service-green
  ```

---

### Step 7: Switch Traffic to Green Deployment

- Update the service selector to route traffic to the green deployment:
  ```bash
  kubectl patch service patient-record-service -p '{"spec":{"selector":{"app":"patient-record-service-green"}}}'
  ```

---

### Step 8: Scale Down Blue Deployment

- Scale down the blue deployment to retain it as a backup:
  ```bash
  kubectl scale deployment patient-record-service-blue --replicas=0
  ```

---

### Step 9: Rollback to Blue Deployment (If Necessary)

- If the green deployment fails, rollback to the blue deployment:
  ```bash
  kubectl patch service patient-record-service -p '{"spec":{"selector":{"app":"patient-record-service-blue"}}}'
  kubectl scale deployment patient-record-service-blue --replicas=1
  ```

---

### Step 10: Cleanup Blue Deployment (Optional)

- After confirming the green deployment is stable, delete the blue deployment:
  ```bash
  kubectl delete deployment patient-record-service-blue
  ```

---

## Validation Steps

### Health Check

- Validate the health of the service:
  ```bash
  curl http://patient-record-service/patients
  ```

### Load Testing

- Perform load testing using tools like JMeter or k6 to verify performance.

### Integration Testing

- Test the integration of the service with other components (e.g., databases, external APIs).

---

## Troubleshooting

### Issue: "No nodes available to schedule pods"

1. Check the status of nodes:
   ```bash
   kubectl get nodes
   kubectl describe nodes
   ```
2. Scale the cluster if necessary:
   ```bash
   gcloud container clusters resize healthsync-cluster --node-pool pool-2 --num-nodes=3 --zone us-east1-c
   ```

### Issue: "Deployment rollout failed"

1. Check the deployment status:
   ```bash
   kubectl rollout status deployment/patient-record-service-green
   ```
2. Investigate pod logs for errors:
   ```bash
   kubectl logs <pod-name>
   ```

---

## Monitoring

- Use tools like Prometheus, Grafana, or Google Cloud Console to monitor the application’s health and performance.

---

## Notes

- This runbook ensures a structured and reliable approach to deploying the Patient Record Service.
- Keep the runbook updated as the pipeline or deployment process evolves.

---
